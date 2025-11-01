import Stripe from 'stripe';
import { menuData } from '../menu-data.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function buildPriceIndex(data = []) {
  const index = new Map();

  const slugify = (name = '') =>
    name
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  for (const category of data) {
    for (const item of category.items || []) {
      const slug = slugify(item.name);
      if (!index.has(slug)) {
        index.set(slug, {
          name: item.name,
          amount: Math.round((item.price || 0) * 100)
        });
      }
    }
  }

  return index;
}

const PRICE_INDEX = buildPriceIndex(menuData);

function lookupMenuItem(identifier, fallbackName, fallbackPrice) {
  const normalizedId = (identifier || fallbackName || '')
    .toString()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const cached = PRICE_INDEX.get(normalizedId);
  if (cached) {
    return cached;
  }

  if (fallbackName && fallbackPrice) {
    return {
      name: fallbackName,
      amount: Math.round(fallbackPrice)
    };
  }

  return null;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const { items, customer } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Items are required' }));
      return;
    }

    // Build line items for Stripe
    const lineItems = [];
    
    for (const cartItem of items) {
      const quantity = Math.max(1, parseInt(cartItem.quantity, 10) || 1);
      const priceRecord = lookupMenuItem(
        cartItem.id,
        cartItem.name,
        cartItem.price
      );

      if (!priceRecord || !priceRecord.amount) {
        console.warn(`Menu item not found or invalid amount: ${cartItem.id}`);
        continue;
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: priceRecord.name,
            description: 'Sisters Cafe menu item'
          },
          tax_behavior: 'exclusive',
          unit_amount: priceRecord.amount
        },
        quantity
      });
    }

    if (lineItems.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No valid menu items found' }));
      return;
    }

    // Determine the domain for success/cancel URLs
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const domain = `${protocol}://${host}`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      // Note: automatic_tax requires business address configured in Stripe Dashboard
      // Disable for development, enable for production after configuring
      // automatic_tax: {
      //   enabled: true,
      // },
      customer_creation: 'always',
      success_url: `${domain}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/cancel.html`,
      customer_email: customer?.email || undefined,
      metadata: {
        customer_name: customer?.name || '',
        customer_phone: customer?.phone || '',
        pickup_time: customer?.pickup_time || '',
        order_notes: customer?.order_notes || ''
      }
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url: session.url }));

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: error.message || 'Internal server error'
    }));
  }
}
