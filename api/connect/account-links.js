import Stripe from 'stripe';

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil'
});

/**
 * Stripe Connect Account Links API
 * Creates account links for onboarding connected accounts
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

  try {
    await createAccountLink(req, res);
  } catch (error) {
    console.error('❌ Account Links API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

/**
 * Create an account link for onboarding
 * Account links are temporary URLs that allow connected accounts to complete onboarding
 */
async function createAccountLink(req, res) {
  const { account_id, return_url, refresh_url } = req.body;

  // Validate required fields
  if (!account_id) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'account_id is required'
    });
  }

  // Get the base URL for return/refresh URLs
  const baseUrl = getBaseUrl(req);
  const defaultReturnUrl = return_url || `${baseUrl}/connect/onboarding-complete`;
  const defaultRefreshUrl = refresh_url || `${baseUrl}/connect/onboarding-refresh`;

  try {
    console.log(`🔗 Creating account link for: ${account_id}`);

    // First, verify the account exists and get its current status
    const account = await stripe.accounts.retrieve(account_id);
    
    console.log(`📊 Account ${account_id} current status:`, {
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      requirements_due: account.requirements.currently_due.length
    });

    // Create the account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      // The connected account to onboard
      account: account_id,
      
      // URL to redirect to after successful onboarding
      return_url: defaultReturnUrl,
      
      // URL to redirect to if the link expires or needs to be refreshed
      refresh_url: defaultRefreshUrl,
      
      // Type of account link - 'account_onboarding' for initial setup
      type: 'account_onboarding'
    });

    console.log(`✅ Account link created for ${account_id}`);
    console.log(`🔗 Onboarding URL: ${accountLink.url}`);

    // Return the account link information
    res.status(200).json({
      success: true,
      account_link: {
        url: accountLink.url,
        expires_at: accountLink.expires_at,
        account_id: account_id
      },
      account_status: {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements_due: account.requirements.currently_due.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to create account link:', error);
    
    // Handle specific Stripe errors
    if (error.code === 'account_invalid') {
      res.status(404).json({ 
        error: 'Account not found', 
        message: `Connected account ${account_id} does not exist` 
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({ 
        error: 'Invalid request', 
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Account link creation failed', 
        message: error.message 
      });
    }
  }
}

/**
 * Helper function to determine the base URL for return/refresh URLs
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