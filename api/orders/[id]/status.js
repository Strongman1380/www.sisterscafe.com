import { orders } from '../../orders.js';

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
    const { id } = req.query;
    const { status } = req.body;

    if (!id || !status) {
      res.status(400).json({ error: 'Order ID and status are required' });
      return;
    }

    // Find the order
    const order = orders.find(o => o.id === id);
    
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Update the order status
    order.status = status;
    order.updated_at = new Date().toISOString();

    res.status(200).json({ success: true, order });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}