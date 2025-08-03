import { orders } from '../orders.js';

export default function handler(req, res) {
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
    // Count orders before clearing
    const totalOrders = orders.length;
    const demoOrders = orders.filter(order => order.is_demo).length;
    
    // Remove all demo orders
    const remainingOrders = orders.filter(order => !order.is_demo);
    
    // Clear the orders array and add back non-demo orders
    orders.length = 0;
    orders.push(...remainingOrders);
    
    console.log(`Cleared ${demoOrders} demo orders (${orders.length} orders remaining)`);
    
    res.status(200).json({ 
      success: true, 
      cleared: demoOrders,
      remaining: orders.length,
      message: `Cleared ${demoOrders} demo orders`
    });
    
  } catch (error) {
    console.error('Error clearing demo orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}