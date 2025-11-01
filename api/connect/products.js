import Stripe from 'stripe';

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil'
});

// In-memory storage for product-to-account mapping
// In production, use a proper database like Vercel KV or PostgreSQL
let productAccountMappings = [];

/**
 * Stripe Connect Products API
 * Handles creating products at the platform level and managing account mappings
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
      // Create a new product
      await createProduct(req, res);
    } else if (req.method === 'GET') {
      // Get products (with optional filtering by account)
      await getProducts(req, res);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Products API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

/**
 * Create a new product at the platform level
 * Products are created on the platform account, not the connected account
 */
async function createProduct(req, res) {
  const { 
    name, 
    description, 
    price_in_cents, 
    currency = 'usd', 
    connected_account_id,
    images = []
  } = req.body;

  // Validate required fields
  if (!name || !price_in_cents || !connected_account_id) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'name, price_in_cents, and connected_account_id are required'
    });
  }

  // Validate price
  if (typeof price_in_cents !== 'number' || price_in_cents <= 0) {
    return res.status(400).json({
      error: 'Invalid price',
      message: 'price_in_cents must be a positive number'
    });
  }

  try {
    console.log(`🛍️ Creating product: ${name} for account ${connected_account_id}`);

    // First, verify the connected account exists
    const account = await stripe.accounts.retrieve(connected_account_id);
    
    if (!account.charges_enabled) {
      return res.status(400).json({
        error: 'Account not ready',
        message: 'Connected account must complete onboarding before creating products'
      });
    }

    // Create product at the platform level (not on connected account)
    const product = await stripe.products.create({
      // Basic product information
      name: name,
      description: description || `Product from ${account.business_profile?.name || 'merchant'}`,
      
      // Product images (optional)
      images: images.length > 0 ? images : undefined,
      
      // Default price configuration
      default_price_data: {
        unit_amount: price_in_cents,
        currency: currency.toLowerCase()
      },

      // Store connected account mapping in metadata
      metadata: {
        connected_account_id: connected_account_id,
        merchant_name: account.business_profile?.name || account.email,
        created_by: 'sisters_cafe_platform',
        created_at: new Date().toISOString()
      }
    });

    // Store the product-to-account mapping in memory
    // In production, store this in a database
    const mapping = {
      product_id: product.id,
      price_id: product.default_price,
      connected_account_id: connected_account_id,
      merchant_name: account.business_profile?.name || account.email,
      created_at: new Date().toISOString()
    };
    
    productAccountMappings.push(mapping);

    console.log(`✅ Product created: ${product.id} (Price: ${product.default_price})`);

    // Return product information with account details
    res.status(200).json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price_id: product.default_price,
        price_in_cents: price_in_cents,
        currency: currency,
        images: product.images,
        connected_account_id: connected_account_id,
        merchant_name: account.business_profile?.name || account.email,
        created: product.created
      }
    });

  } catch (error) {
    console.error('❌ Failed to create product:', error);
    
    // Handle specific Stripe errors
    if (error.code === 'account_invalid') {
      res.status(404).json({ 
        error: 'Connected account not found', 
        message: error.message 
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({ 
        error: 'Invalid request', 
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Product creation failed', 
        message: error.message 
      });
    }
  }
}

/**
 * Get products with optional filtering by connected account
 * Returns all products from the platform with their account mappings
 */
async function getProducts(req, res) {
  const { connected_account_id, limit = 100 } = req.query;

  try {
    console.log(`📋 Retrieving products${connected_account_id ? ` for account ${connected_account_id}` : ''}`);

    // Get products from Stripe
    const productsResponse = await stripe.products.list({
      limit: parseInt(limit),
      expand: ['data.default_price'] // Include price information
    });

    // Filter products that have connected account metadata
    let products = productsResponse.data.filter(product => 
      product.metadata && product.metadata.connected_account_id
    );

    // If filtering by specific account, apply filter
    if (connected_account_id) {
      products = products.filter(product => 
        product.metadata.connected_account_id === connected_account_id
      );
    }

    // Enrich products with mapping information
    const enrichedProducts = products.map(product => {
      const mapping = productAccountMappings.find(m => m.product_id === product.id);
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price_id: product.default_price?.id,
        price_in_cents: product.default_price?.unit_amount,
        currency: product.default_price?.currency,
        images: product.images,
        connected_account_id: product.metadata.connected_account_id,
        merchant_name: product.metadata.merchant_name,
        created: product.created,
        active: product.active
      };
    });

    console.log(`✅ Found ${enrichedProducts.length} products`);

    res.status(200).json({
      success: true,
      products: enrichedProducts,
      total_count: enrichedProducts.length
    });

  } catch (error) {
    console.error('❌ Failed to retrieve products:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve products', 
      message: error.message 
    });
  }
}

// Export the mappings array so other modules can access it if needed
export { productAccountMappings };