// In-memory order storage (in production, use a database like Vercel KV or external DB)
let orders = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return orders sorted by creation date (newest first)
    const sortedOrders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.status(200).json(sortedOrders);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Export orders array so webhook can access it
export { orders };