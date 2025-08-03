import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Menu data for price lookup
const MENU_DATA = [
  {
    category: "Appetizers",
    items: [
      { id: "mini_tacos", name: "Mini Tacos", price: 5.00 },
      { id: "french_fries", name: "French Fries", price: 4.50 },
      { id: "tator_kegs", name: "Tator Kegs", price: 6.00 },
      { id: "onion_rings", name: "Onion Rings", price: 5.50 },
      { id: "mozzarella_sticks", name: "Mozzarella Sticks", price: 6.50 },
      { id: "jalapeno_poppers", name: "Jalapeño Poppers", price: 6.00 },
      { id: "loaded_nachos", name: "Loaded Nachos", price: 8.00 },
      { id: "buffalo_wings", name: "Buffalo Wings (6pc)", price: 7.50 },
      { id: "potato_skins", name: "Potato Skins", price: 6.50 },
      { id: "cheese_curds", name: "Cheese Curds", price: 5.50 }
    ]
  },
  {
    category: "Soups",
    items: [
      { id: "soup_bowl", name: "Soup Bowl", price: 4.50 }
    ]
  },
  {
    category: "Sandwiches",
    items: [
      { id: "hamburger", name: "Hamburgers", price: 8.00 },
      { id: "cheeseburger", name: "Cheeseburger", price: 8.50 },
      { id: "bacon_cheeseburger", name: "Bacon Cheeseburger", price: 11.00 },
      { id: "mushroom_swiss", name: "Mushroom Swiss Burger", price: 9.50 },
      { id: "bbq_burger", name: "BBQ Burger", price: 9.00 },
      { id: "chicken_sandwich", name: "Grilled Chicken Sandwich", price: 8.50 },
      { id: "fish_sandwich", name: "Fish Sandwich", price: 8.00 },
      { id: "blt", name: "BLT", price: 7.50 },
      { id: "club_sandwich", name: "Club Sandwich", price: 9.00 },
      { id: "reuben", name: "Reuben", price: 9.50 },
      { id: "philly_cheesesteak", name: "Philly Cheesesteak", price: 10.00 },
      { id: "pulled_pork", name: "Pulled Pork Sandwich", price: 8.50 }
    ]
  },
  {
    category: "Dinner Meals",
    items: [
      { id: "chicken_fried_steak", name: "Chicken Fried Steak", price: 11.00 },
      { id: "hamburger_steak", name: "Hamburger Steak", price: 11.00 },
      { id: "grilled_chicken", name: "Grilled Chicken Breast", price: 10.50 },
      { id: "fish_chips", name: "Fish & Chips", price: 12.00 },
      { id: "meatloaf", name: "Homemade Meatloaf", price: 10.00 }
    ]
  },
  {
    category: "Baskets",
    items: [
      { id: "chicken_strips", name: "Chicken Strip Basket", price: 9.00 },
      { id: "shrimp_basket", name: "Shrimp Basket", price: 10.00 }
    ]
  },
  {
    category: "Salads",
    items: [
      { id: "house_salad", name: "House Salad", price: 6.00 },
      { id: "caesar_salad", name: "Caesar Salad", price: 7.00 },
      { id: "chef_salad", name: "Chef Salad", price: 8.50 }
    ]
  },
  {
    category: "Sides",
    items: [
      { id: "side_fries", name: "Side of Fries", price: 3.00 },
      { id: "mashed_potatoes", name: "Mashed Potatoes", price: 3.50 },
      { id: "green_beans", name: "Green Beans", price: 3.00 },
      { id: "corn", name: "Corn", price: 3.00 },
      { id: "coleslaw", name: "Coleslaw", price: 2.50 }
    ]
  },
  {
    category: "Eggs & Toast",
    items: [
      { id: "scrambled_eggs", name: "Scrambled Eggs (2)", price: 4.00 },
      { id: "fried_eggs", name: "Fried Eggs (2)", price: 4.00 },
      { id: "toast", name: "Toast (2 slices)", price: 2.00 },
      { id: "english_muffin", name: "English Muffin", price: 2.50 },
      { id: "pancakes", name: "Pancakes (3)", price: 6.00 }
    ]
  },
  {
    category: "Drinks",
    items: [
      { id: "soda", name: "Soda", price: 2.00 },
      { id: "coffee", name: "Coffee", price: 2.00 },
      { id: "tea", name: "Tea", price: 2.00 },
      { id: "juice", name: "Juice", price: 2.50 },
      { id: "milk_small", name: "Milk (Small)", price: 1.50 },
      { id: "milk_large", name: "Milk (Large)", price: 2.00 },
      { id: "chocolate_milk", name: "Chocolate Milk", price: 2.50 },
      { id: "milkshake", name: "Milkshake", price: 4.00 }
    ]
  }
];

// Helper function to find menu item by ID or name
function findMenuItem(identifier) {
  for (const category of MENU_DATA) {
    for (const item of category.items) {
      if (item.id === identifier || 
          item.name.toLowerCase().replace(/[^a-z0-9]/g, '_') === identifier ||
          item.name.toLowerCase() === identifier.toLowerCase()) {
        return item;
      }
    }
  }
  return null;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { items, customer } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Items are required' });
      return;
    }

    // Build line items for Stripe
    const lineItems = [];
    
    for (const cartItem of items) {
      const menuItem = findMenuItem(cartItem.id);
      
      if (!menuItem) {
        console.warn(`Menu item not found: ${cartItem.id}`);
        continue;
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: menuItem.name,
            description: `From Sisters Cafe menu`
          },
          unit_amount: Math.round(menuItem.price * 100) // Convert to cents
        },
        quantity: cartItem.quantity || 1
      });
    }

    if (lineItems.length === 0) {
      res.status(400).json({ error: 'No valid menu items found' });
      return;
    }

    // Calculate tax manually (8.75% tax rate)
    const subtotal = lineItems.reduce((sum, item) => 
      sum + (item.price_data.unit_amount * item.quantity), 0
    );
    const taxAmount = Math.round(subtotal * 0.0875);
    
    // Add tax as a separate line item
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax (8.75%)',
            description: 'Local sales tax'
          },
          unit_amount: taxAmount
        },
        quantity: 1
      });
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
      success_url: `${domain}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/cancel.html`,
      customer_email: customer?.email || undefined,
      metadata: {
        customer_name: customer?.name || '',
        customer_phone: customer?.phone || '',
        sms_notifications: customer?.sms_notifications || 'false'
      }
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}