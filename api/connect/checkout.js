import Stripe from 'stripe';

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil'
});

/**
 * Stripe Connect Checkout API
 * Creates checkout sessions with destination charges and application fees
 */
export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate Stripe configuration
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not configured');
    return res.status(500).json({ 
      error: 'Stripe configuration missing',
      message: 'Please set STRIPE_SECRET_KEY in your environment variables'
    });
  }

  // Validate application fee configuration
  if (!process.env.STRIPE_APPLICATION_FEE_PERCENT) {
    console.error('❌ STRIPE_APPLICATION_FEE_PERCENT is not configured');
    return res.status(500).json({ 
      error: 'Application fee configuration missing',
      message: 'Please set STRIPE_APPLICATION_FEE_PERCENT in your environment variables'
    });
  }

  try {
    await createCheckoutSession(req, res);
  } catch (error) {
    console.error('❌ Checkout API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

/**
 * Create a checkout session with destination charge and application fee
 * Uses hosted checkout for simplicity
 */
async function createCheckoutSession(req, res) {
  const { 
    items, // Array of { price_id, quantity, connected_account_id }
    success_url,
    cancel_url,
    customer_email
  } = req.body;

  // Validate required fields
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'items array is required and must not be empty'
    });
  }

  // Get base URL for success/cancel URLs
  const baseUrl = getBaseUrl(req);
  const defaultSuccessUrl = success_url || `${baseUrl}/connect/success?session_id={CHECKOUT_SESSION_ID}`;
  const defaultCancelUrl = cancel_url || `${baseUrl}/connect/storefront`;

  try {
    // Validate all items have required fields and same connected account
    const connectedAccountIds = new Set();
    const lineItems = [];
    let totalAmount = 0;

    for (const item of items) {
      if (!item.price_id || !item.quantity || !item.connected_account_id) {
        return res.status(400).json({
          error: 'Invalid item',
          message: 'Each item must have price_id, quantity, and connected_account_id'
        });
      }

      connectedAccountIds.add(item.connected_account_id);
      
      // Get price information to calculate total
      const price = await stripe.prices.retrieve(item.price_id);
      const itemTotal = price.unit_amount * item.quantity;
      totalAmount += itemTotal;

      lineItems.push({
        price: item.price_id,
        quantity: item.quantity
      });
    }

    // For simplicity, this demo only supports single merchant checkout
    // In a real marketplace, you'd need to handle multi-merchant carts differently
    if (connectedAccountIds.size > 1) {
      return res.status(400).json({
        error: 'Multi-merchant checkout not supported',
        message: 'All items must be from the same merchant for this demo'
      });
    }

    const connectedAccountId = Array.from(connectedAccountIds)[0];

    // Verify the connected account exists and is ready
    const account = await stripe.accounts.retrieve(connectedAccountId);
    
    if (!account.charges_enabled) {
      return res.status(400).json({
        error: 'Merchant not ready',
        message: 'The merchant account is not ready to accept payments'
      });
    }

    // Calculate application fee
    const feePercent = parseFloat(process.env.STRIPE_APPLICATION_FEE_PERCENT);
    const applicationFeeAmount = Math.round(totalAmount * feePercent);

    console.log(`💳 Creating checkout session:`, {
      total_amount: totalAmount,
      application_fee: applicationFeeAmount,
      connected_account: connectedAccountId,
      merchant: account.business_profile?.name || account.email
    });

    // Create checkout session with destination charge
    const session = await stripe.checkout.sessions.create({
      // Line items for the checkout
      line_items: lineItems,

      // Payment configuration with destination charge
      payment_intent_data: {
        // Application fee that the platform keeps
        application_fee_amount: applicationFeeAmount,
        
        // Transfer remaining funds to connected account
        transfer_data: {
          destination: connectedAccountId
        },

        // Store metadata for tracking
        metadata: {
          connected_account_id: connectedAccountId,
          merchant_name: account.business_profile?.name || account.email,
          application_fee_amount: applicationFeeAmount.toString(),
          created_by: 'sisters_cafe_platform'
        }
      },

      // Checkout configuration
      mode: 'payment',
      success_url: defaultSuccessUrl,
      cancel_url: defaultCancelUrl,

      // Optional customer email
      customer_email: customer_email,

      // Metadata for the session
      metadata: {
        connected_account_id: connectedAccountId,
        merchant_name: account.business_profile?.name || account.email,
        total_items: items.length.toString()
      }
    });

    console.log(`✅ Checkout session created: ${session.id}`);
    console.log(`🔗 Checkout URL: ${session.url}`);

    // Return checkout session information
    res.status(200).json({
      success: true,
      checkout_session: {
        id: session.id,
        url: session.url,
        expires_at: session.expires_at
      },
      payment_details: {
        total_amount: totalAmount,
        application_fee_amount: applicationFeeAmount,
        merchant_receives: totalAmount - applicationFeeAmount,
        connected_account_id: connectedAccountId,
        merchant_name: account.business_profile?.name || account.email
      }
    });

  } catch (error) {
    console.error('❌ Failed to create checkout session:', error);
    
    // Handle specific Stripe errors
    if (error.code === 'account_invalid') {
      res.status(404).json({ 
        error: 'Connected account not found', 
        message: error.message 
      });
    } else if (error.code === 'price_invalid') {
      res.status(400).json({ 
        error: 'Invalid price', 
        message: 'One or more price IDs are invalid' 
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({ 
        error: 'Invalid request', 
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Checkout session creation failed', 
        message: error.message 
      });
    }
  }
}

/**
 * Helper function to determine the base URL for success/cancel URLs
 * Uses the request headers to construct the appropriate URL
 */
function getBaseUrl(req) {
  // Check for common headers that indicate the original URL
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 
                  (req.connection && req.connection.encrypted ? 'https' : 'http');
  
  // For development, default to localhost
  if (host && host.includes('localhost')) {
    return `${protocol}://${host}`;
  }
  
  // For production, use the host header
  if (host) {
    return `https://${host}`;
  }
  
  // Fallback for development
  return 'http://localhost:3000';
}