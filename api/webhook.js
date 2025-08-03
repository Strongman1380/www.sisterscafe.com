import Stripe from 'stripe';
import { orders } from './orders.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Get raw body for webhook verification
    const body = JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: 'Webhook signature verification failed' });
    return;
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Save order to memory (in production, save to database)
        const order = {
          id: `SC${Date.now()}${Math.floor(Math.random() * 1000)}`,
          stripe_session_id: session.id,
          customer_name: session.metadata?.customer_name || '',
          customer_phone: session.metadata?.customer_phone || '',
          customer_email: session.customer_email || '',
          sms_notifications: session.metadata?.sms_notifications === 'true',
          amount_total: session.amount_total,
          status: 'paid',
          created_at: new Date().toISOString(),
          items: [], // Could be populated from line items if needed
          notes: ''
        };
        
        orders.push(order);
        console.log(`Order saved: ${order.id} for ${order.customer_name}`);
        
        // Here you can add:
        // - SMS notification if customer opted in
        // - Email confirmation
        // - Inventory updates
        
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Configure to receive raw body for webhook verification
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}