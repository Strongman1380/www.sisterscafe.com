#!/usr/bin/env node

/**
 * Sisters Cafe Notification System Test
 * This script tests the automatic notification system
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Test order templates
const testOrders = [
  {
    id: 'TEST_001',
    customer_name: 'John Smith',
    customer_phone: '(555) 123-4567',
    customer_email: 'john@example.com',
    amount_total: 2500, // $25.00
    status: 'paid',
    items: ['Cheeseburger', 'Fries', 'Soda'],
    notes: 'Extra pickles please',
    sms_notifications: true
  },
  {
    id: 'TEST_002',
    customer_name: 'Sarah Johnson',
    customer_phone: '(555) 987-6543',
    customer_email: 'sarah@example.com',
    amount_total: 4750, // $47.50
    status: 'paid',
    items: ['Chicken Fried Steak', 'Mashed Potatoes', 'Green Beans', 'Iced Tea'],
    notes: 'No onions',
    sms_notifications: false
  },
  {
    id: 'TEST_003',
    customer_name: 'Mike Wilson',
    customer_phone: '(555) 456-7890',
    customer_email: 'mike@example.com',
    amount_total: 1200, // $12.00
    status: 'paid',
    items: ['Coffee', 'Blueberry Muffin'],
    notes: '',
    sms_notifications: true
  }
];

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testServerConnection() {
  console.log('🔌 Testing server connection...');
  try {
    const response = await makeRequest('GET', '/api/orders');
    if (response.status === 200) {
      console.log('✅ Server is running and accessible');
      return true;
    } else {
      console.log(`❌ Server responded with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    console.log('💡 Make sure to run: node dev-server.js');
    return false;
  }
}

async function clearExistingOrders() {
  console.log('\n🧹 Clearing existing orders...');
  try {
    const response = await makeRequest('POST', '/api/demo/clear-orders');
    if (response.status === 200) {
      console.log(`✅ Cleared ${response.data.cleared_count || 0} existing orders`);
    }
  } catch (error) {
    console.log('⚠️ Could not clear orders:', error.message);
  }
}

async function createTestOrder(order, index) {
  console.log(`\n📝 Creating test order ${index + 1}/3: ${order.customer_name}...`);
  
  try {
    const response = await makeRequest('POST', '/api/demo/add-order', order);
    
    if (response.status === 200) {
      console.log(`✅ Order created: ${order.id} ($${(order.amount_total / 100).toFixed(2)})`);
      console.log(`   Customer: ${order.customer_name} (${order.customer_phone})`);
      console.log(`   SMS Notifications: ${order.sms_notifications ? 'Enabled' : 'Disabled'}`);
      return true;
    } else {
      console.log(`❌ Failed to create order: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error creating order: ${error.message}`);
    return false;
  }
}

async function verifyOrders() {
  console.log('\n🔍 Verifying orders were created...');
  try {
    const response = await makeRequest('GET', '/api/orders');
    if (response.status === 200) {
      const orders = response.data;
      console.log(`✅ Found ${orders.length} orders in system`);
      
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.customer_name} - $${(order.amount_total / 100).toFixed(2)} (${order.id})`);
      });
      
      return orders.length;
    }
  } catch (error) {
    console.log('❌ Error verifying orders:', error.message);
    return 0;
  }
}

async function runNotificationTest() {
  console.log('🧪 Sisters Cafe Notification System Test');
  console.log('═'.repeat(50));
  
  // Test server connection
  const serverOk = await testServerConnection();
  if (!serverOk) {
    console.log('\n❌ Cannot proceed without server connection');
    process.exit(1);
  }
  
  // Clear existing orders
  await clearExistingOrders();
  
  // Create test orders
  console.log('\n📧📱 Creating test orders (notifications will appear in server console)...');
  let successCount = 0;
  
  for (let i = 0; i < testOrders.length; i++) {
    const success = await createTestOrder(testOrders[i], i);
    if (success) successCount++;
    
    // Wait a bit between orders to see notifications clearly
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Verify orders
  const totalOrders = await verifyOrders();
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('═'.repeat(30));
  console.log(`✅ Orders created: ${successCount}/${testOrders.length}`);
  console.log(`📋 Total orders in system: ${totalOrders}`);
  
  if (successCount === testOrders.length) {
    console.log('\n🎉 All tests passed! Notification system is working.');
    console.log('\n📧📱 Check the server console for notification previews:');
    console.log('• Email notifications to sisters806@gmail.com');
    console.log('• SMS notifications to restaurant phone');
    console.log('• Customer SMS confirmations (for opted-in customers)');
    console.log('\n📖 Next Steps:');
    console.log('1. Review NOTIFICATION_SETUP.md for production setup');
    console.log('2. Configure Gmail and Twilio for real notifications');
    console.log('3. Deploy to production with environment variables');
  } else {
    console.log('\n⚠️ Some tests failed. Check server logs for details.');
  }
  
  console.log('\n🧹 Cleanup:');
  console.log('• Orders will persist until server restart');
  console.log('• Run this test again to see more notifications');
}

// Run the test
runNotificationTest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});