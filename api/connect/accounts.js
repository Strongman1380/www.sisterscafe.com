import Stripe from 'stripe';

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil'
});

/**
 * Stripe Connect Accounts API
 * Handles creating and retrieving connected accounts for the platform
 */
export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Validate Stripe configuration
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not configured');
    return res.status(500).json({ 
      error: 'Stripe configuration missing',
      message: 'Please set STRIPE_SECRET_KEY in your environment variables'
    });
  }

  try {
    if (req.method === 'POST') {
      // Create a new connected account
      await createConnectedAccount(req, res);
    } else if (req.method === 'GET') {
      // Retrieve account information
      await getAccountInfo(req, res);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Stripe Connect API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

/**
 * Create a new connected account
 * Uses controller configuration where platform handles pricing and fees
 */
async function createConnectedAccount(req, res) {
  const { email, business_name, country = 'US' } = req.body;

  // Validate required fields
  if (!email || !business_name) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'email and business_name are required'
    });
  }

  try {
    console.log(`🏪 Creating connected account for: ${business_name} (${email})`);

    // Create connected account with controller configuration
    // Platform is responsible for pricing, fees, and losses
    const account = await stripe.accounts.create({
      // Account holder information
      email: email,
      country: country,
      
      // Controller configuration - platform manages everything
      controller: {
        // Platform is responsible for pricing and fee collection
        fees: {
          payer: 'application' // Platform collects fees from customers
        },
        // Platform is responsible for losses, refunds, and chargebacks
        losses: {
          payments: 'application' // Platform handles payment disputes
        },
        // Give merchants access to Express Dashboard for account management
        stripe_dashboard: {
          type: 'express' // Simplified dashboard experience
        }
      },

      // Business profile information
      business_profile: {
        name: business_name,
        support_email: email
      },

      // Capabilities the account needs
      capabilities: {
        transfers: { requested: true }, // Ability to receive transfers
        card_payments: { requested: true } // Ability to accept card payments
      },

      // Store business name in metadata for easy reference
      metadata: {
        business_name: business_name,
        created_by: 'sisters_cafe_platform',
        created_at: new Date().toISOString()
      }
    });

    console.log(`✅ Connected account created: ${account.id}`);

    // Return account information
    res.status(200).json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        business_name: business_name,
        country: account.country,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        created: account.created
      }
    });

  } catch (error) {
    console.error('❌ Failed to create connected account:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      res.status(400).json({ error: 'Card error', message: error.message });
    } else if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({ error: 'Invalid request', message: error.message });
    } else {
      res.status(500).json({ error: 'Account creation failed', message: error.message });
    }
  }
}

/**
 * Retrieve account information and onboarding status
 * Always fetches fresh data from Stripe API (no database caching)
 */
async function getAccountInfo(req, res) {
  const { account_id } = req.query;

  if (!account_id) {
    return res.status(400).json({
      error: 'Missing account_id',
      message: 'account_id query parameter is required'
    });
  }

  try {
    console.log(`🔍 Retrieving account info for: ${account_id}`);

    // Fetch account directly from Stripe API
    const account = await stripe.accounts.retrieve(account_id);

    // Check onboarding requirements
    const requirements = account.requirements;
    const hasRequirements = requirements.currently_due.length > 0 || 
                           requirements.eventually_due.length > 0;

    console.log(`📊 Account ${account_id} status:`, {
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements_due: requirements.currently_due.length
    });

    // Return comprehensive account status
    res.status(200).json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        business_name: account.business_profile?.name || account.metadata?.business_name,
        country: account.country,
        
        // Onboarding status
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        
        // Requirements for onboarding
        requirements: {
          currently_due: requirements.currently_due,
          eventually_due: requirements.eventually_due,
          past_due: requirements.past_due,
          pending_verification: requirements.pending_verification
        },
        
        // Overall onboarding status
        onboarding_complete: account.charges_enabled && account.payouts_enabled,
        needs_onboarding: hasRequirements || !account.details_submitted,
        
        // Timestamps
        created: account.created
      }
    });

  } catch (error) {
    console.error('❌ Failed to retrieve account:', error);
    
    if (error.code === 'account_invalid') {
      res.status(404).json({ error: 'Account not found', message: error.message });
    } else {
      res.status(500).json({ error: 'Failed to retrieve account', message: error.message });
    }
  }
}