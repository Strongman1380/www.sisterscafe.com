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
    const order = req.body;
    
    // Validate required fields
    if (!order.id || !order.customer_name || !order.amount_total) {
      res.status(400).json({ error: 'Missing required order fields' });
      return;
    }
    
    // Add demo flag
    order.is_demo = true;
    order.created_at = order.created_at || new Date().toISOString();
    order.updated_at = new Date().toISOString();
    
    // Add to orders array
    orders.push(order);
    
    console.log(`Demo order created: ${order.id} for ${order.customer_name} ($${(order.amount_total / 100).toFixed(2)})`);
    
    res.status(200).json({ 
      success: true, 
      order: order,
      message: 'Demo order created successfully'
    });
    
  } catch (error) {
    console.error('Error creating demo order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}