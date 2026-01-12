import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Menu data loaded inline for server-side use
const menuData = [
  { category: "Appetizers", items: [
    { name: "Mini Tacos", price: 5.00 }, { name: "French Fries", price: 4.50 },
    { name: "Tator Kegs (Cheddar Jalapeno)", price: 6.00 }, { name: "Tator Kegs (Cheddar Bacon)", price: 6.00 },
    { name: "Onion Chips", price: 5.00 }, { name: "Cheese Balls", price: 5.00 },
    { name: "Spicy Cheese Balls", price: 5.00 }, { name: "Breaded Mushrooms", price: 5.00 },
    { name: "Breaded Cauliflower", price: 5.00 }, { name: "Cinnamon Roll", price: 3.25 }
  ]},
  { category: "Soups", items: [{ name: "Soup Bowl", price: 4.50 }]},
  { category: "Sandwiches", items: [
    { name: "Hamburgers", price: 8.00 }, { name: "Cheeseburger", price: 8.50 },
    { name: "Double Cheeseburger", price: 13.50 }, { name: "Bacon Cheeseburger", price: 11.00 },
    { name: "Double Bacon Cheeseburger", price: 13.50 }, { name: "Swiss Mushroom Burger", price: 9.00 },
    { name: "Western Burger", price: 12.95 }, { name: "Patty Melt", price: 9.00 },
    { name: "Pork Tenderloin", price: 8.00 }, { name: "Fish Sandwich", price: 8.00 },
    { name: "Chicken Parmesan", price: 9.00 },
    { name: "Taco Burger (Seasoned Beef, Cheese Mix, Salsa, Lettuce, Tomatoes, and Sour Cream)", price: 10.95 }
  ]},
  { category: "Dinner Meals", items: [
    { name: "Chicken Fried Steak", price: 11.00 }, { name: "Hamburger Steak", price: 11.00 },
    { name: "Salisbury Steak", price: 11.00 }, { name: "Chicken Parmesan", price: 11.00 },
    { name: "Pork Tenderloin", price: 11.00 }
  ]},
  { category: "Baskets", items: [
    { name: "Fried Fish Basket", price: 10.00 }, { name: "Mini Corn Dog Basket", price: 10.00 }
  ]},
  { category: "Salads", items: [
    { name: "Green Salad", price: 4.00 }, { name: "Chef Salad (Chicken)", price: 9.50 },
    { name: "Chef Salad (Ham)", price: 9.50 }
  ]},
  { category: "Sides", items: [
    { name: "Bacon (4 Slices)", price: 5.00 }, { name: "Sausage (2 Patties)", price: 5.00 },
    { name: "Ham (2 Slices)", price: 5.00 }, { name: "Hashbrowns", price: 3.00 },
    { name: "Toast (2 Slices)", price: 3.00 }
  ]},
  { category: "Eggs & Toast", items: [
    { name: "1 Egg & Toast", price: 6.00 }, { name: "1 Egg & Toast with Meat", price: 8.00 },
    { name: "2 Eggs & Toast", price: 7.00 }, { name: "2 Eggs & Toast with Meat", price: 9.00 },
    { name: "Omelet Combo", price: 14.00 }
  ]},
  { category: "Drinks", items: [
    { name: "Soda", price: 2.00 }, { name: "Hot Tea", price: 2.00 }, { name: "Iced Tea", price: 2.00 },
    { name: "Lemonade", price: 2.00 }, { name: "Milk Small", price: 1.50 }, { name: "Milk Large", price: 2.00 },
    { name: "OJ Small", price: 1.50 }, { name: "OJ Large", price: 2.00 }
  ]}
];

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

    // Calculate tax using Stripe Tax Calculation API
    // Sisters Cafe address in Geneva, Nebraska
    const taxCalculationItems = lineItems.map(item => ({
      amount: item.price_data.unit_amount * item.quantity,
      quantity: item.quantity,
      reference: item.price_data.product_data.name,
      tax_code: 'txcd_40060003', // Restaurant food and beverages - for immediate consumption
    }));

    let taxAmount = 0;
    let taxCalculation = null;
    
    try {
      // Calculate tax based on restaurant's location (pickup orders)
      taxCalculation = await stripe.tax.calculations.create({
        currency: 'usd',
        line_items: taxCalculationItems,
        customer_details: {
          address: {
            // Sisters Cafe location - customer picks up here
            line1: '606 G St',
            city: 'Geneva',
            state: 'NE',
            postal_code: '68361',
            country: 'US',
          },
          address_source: 'shipping', // For pickup, use restaurant address
        },
      });
      
      taxAmount = taxCalculation.tax_amount_exclusive;
      console.log('Tax calculated:', taxAmount, 'cents for order total:', taxCalculation.amount_total);
    } catch (taxError) {
      console.warn('Tax calculation failed, proceeding without tax:', taxError.message);
      // Continue without tax if calculation fails
    }

    // Build final line items including tax if calculated
    const finalLineItems = [...lineItems];
    
    if (taxAmount > 0) {
      finalLineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Sales Tax',
            description: 'Nebraska state and local sales tax'
          },
          unit_amount: taxAmount
        },
        quantity: 1
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: finalLineItems,
      mode: 'payment',
      customer_creation: 'always',
      success_url: `${domain}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/cancel.html`,
      customer_email: customer?.email || undefined,
      metadata: {
        customer_name: customer?.name || '',
        customer_phone: customer?.phone || '',
        pickup_time: customer?.pickup_time || '',
        order_notes: customer?.order_notes || '',
        tax_calculation_id: taxCalculation?.id || '',
        tax_amount: taxAmount.toString()
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
