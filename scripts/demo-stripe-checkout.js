#!/usr/bin/env node

/**
 * Simple script to create a Stripe Checkout session using the local handler.
 * Prints the session URL so you can open it in a browser for manual testing.
 */

const path = require('path');
const url = require('url');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

async function loadHandler() {
  const modulePath = url.pathToFileURL(path.resolve(__dirname, '..', 'api', 'create-checkout-session.js')).href;
  const mod = await import(modulePath);
  return mod.default;
}

function createMockReq(body) {
  return {
    method: 'POST',
    headers: {
      host: process.env.DEMO_HOST || 'localhost:3000',
      'x-forwarded-proto': process.env.DEMO_PROTOCOL || 'http'
    },
    body
  };
}

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not set. Add it to your .env file before running this script.');
    process.exitCode = 1;
    return;
  }

  const handler = await loadHandler();

  const mockRequest = createMockReq({
    items: [
      { id: 'mini_tacos', name: 'Mini Tacos', quantity: 1 },
      { id: 'cheeseburger', name: 'Cheeseburger', quantity: 2 }
    ],
    customer: {
      name: process.env.DEMO_CUSTOMER_NAME || 'Test Customer',
      phone: process.env.DEMO_CUSTOMER_PHONE || '402-555-0000',
      email: process.env.DEMO_CUSTOMER_EMAIL || 'test@example.com',
      pickup_time: 'In 30 minutes',
      order_notes: 'Demo order created by scripts/demo-stripe-checkout.js',
      address: {
        line1: '123 Demo Street',
        city: 'Geneva',
        state: 'NE',
        postal_code: '68361',
        country: 'US'
      }
    }
  });

  const mockResponse = createMockRes();

  try {
    await handler(mockRequest, mockResponse);

    if (mockResponse.statusCode >= 400) {
      console.error('❌ Failed to create checkout session:', mockResponse.body);
      process.exitCode = 1;
      return;
    }

    const sessionUrl = mockResponse.body?.url;
    if (!sessionUrl) {
      console.error('❌ No checkout URL returned. Response:', mockResponse.body);
      process.exitCode = 1;
      return;
    }

    console.log('✅ Stripe Checkout session created successfully!');
    console.log('➡️  Open this URL in your browser to test the flow:');
    console.log(sessionUrl);
  } catch (error) {
    console.error('❌ Error creating Stripe Checkout session:', error);
    process.exitCode = 1;
  }
}

main();
