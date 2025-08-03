#!/usr/bin/env node

// Simple test script for the admin panel
const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body,
          headers: res.headers
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAdminPanel() {
  console.log('🧪 Testing Sisters Cafe Admin Panel');
  console.log('=' * 50);
  console.log('');
  console.log('⚠️  Make sure to run: npm run dev (or your local server)');
  console.log('');

  try {
    // Test 1: Check if orders API is working
    console.log('1️⃣  Testing Orders API...');
    const ordersResponse = await makeRequest('/api/orders');
    if (ordersResponse.statusCode === 200) {
      const orders = JSON.parse(ordersResponse.body);
      console.log(`   ✅ Orders API working! Found ${orders.length} orders`);
    } else {
      console.log(`   ❌ Orders API failed: ${ordersResponse.statusCode}`);
    }

    // Test 2: Create a demo order
    console.log('\n2️⃣  Testing Demo Order Creation...');
    const demoOrder = {
      id: `SC${Date.now()}${Math.floor(Math.random() * 1000)}`,
      stripe_session_id: `cs_test_${Date.now()}`,
      customer_name: 'Test Customer',
      customer_phone: '(555) 123-4567',
      customer_email: 'test@example.com',
      sms_notifications: true,
      amount_total: 2500, // $25.00
      status: 'paid',
      created_at: new Date().toISOString(),
      items: ['Test Burger', 'Test Fries', 'Test Drink'],
      notes: 'Test order from script'
    };

    const createResponse = await makeRequest('/api/demo/add-order', 'POST', demoOrder);
    if (createResponse.statusCode === 200) {
      console.log(`   ✅ Demo order created successfully!`);
      console.log(`   📋 Order ID: ${demoOrder.id}`);
      console.log(`   👤 Customer: ${demoOrder.customer_name}`);
      console.log(`   💰 Amount: $${(demoOrder.amount_total / 100).toFixed(2)}`);
    } else {
      console.log(`   ❌ Demo order creation failed: ${createResponse.statusCode}`);
      console.log(`   📄 Response: ${createResponse.body}`);
    }

    // Test 3: Verify order appears in orders list
    console.log('\n3️⃣  Verifying Order in List...');
    const updatedOrdersResponse = await makeRequest('/api/orders');
    if (updatedOrdersResponse.statusCode === 200) {
      const updatedOrders = JSON.parse(updatedOrdersResponse.body);
      const testOrder = updatedOrders.find(order => order.id === demoOrder.id);
      if (testOrder) {
        console.log(`   ✅ Order found in list!`);
        console.log(`   📊 Total orders now: ${updatedOrders.length}`);
      } else {
        console.log(`   ❌ Order not found in list`);
      }
    }

    // Test 4: Test order status update
    console.log('\n4️⃣  Testing Order Status Update...');
    const statusUpdateResponse = await makeRequest(
      `/api/orders/${demoOrder.id}/status`, 
      'POST', 
      { status: 'preparing' }
    );
    if (statusUpdateResponse.statusCode === 200) {
      console.log(`   ✅ Order status updated to 'preparing'`);
    } else {
      console.log(`   ❌ Status update failed: ${statusUpdateResponse.statusCode}`);
    }

    console.log('\n🎉 Admin Panel Tests Completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open: http://localhost:3000/admin-demo.html');
    console.log('2. Create some demo orders');
    console.log('3. Open: http://localhost:3000/admin.html');
    console.log('4. Password: sisters2024');
    console.log('5. Test the admin interface!');

    console.log('\n🧹 Cleanup:');
    console.log('- Use the "Clear All Orders" button in the demo page');
    console.log('- Or restart your server to reset in-memory data');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your local server is running');
    console.log('2. Check that all API endpoints are accessible');
    console.log('3. Verify CORS headers are set correctly');
  }
}

// Run the tests
testAdminPanel();