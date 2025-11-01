# Sisters Cafe Order System Troubleshooting Guide

## Quick Test Commands

### 1. Run Comprehensive Test Suite
```bash
node test-order-flow.js
```

### 2. Run Basic Admin Panel Test
```bash
node test-admin-panel.js
```

### 3. Start Development Server
```bash
npm run dev
# or
vercel dev
```

## Common Issues and Solutions

### Issue 1: Orders Not Appearing in Admin Panel

**Symptoms:**
- Demo orders created successfully
- Admin panel shows "No orders yet"
- API returns empty array

**Troubleshooting Steps:**

1. **Check Server Status**
   ```bash
   curl http://localhost:3000/api/orders
   ```
   Expected: `[]` or array of orders

2. **Test Order Creation**
   ```bash
   curl -X POST http://localhost:3000/api/demo/add-order \
     -H "Content-Type: application/json" \
     -d '{
       "id": "SC123456789",
       "customer_name": "Test Customer",
       "customer_phone": "(555) 123-4567",
       "customer_email": "test@example.com",
       "amount_total": 2500,
       "status": "paid",
       "items": ["Test Item"]
     }'
   ```

3. **Verify Order in API**
   ```bash
   curl http://localhost:3000/api/orders
   ```

**Common Causes:**
- Server not running
- In-memory storage reset (server restart)
- CORS issues
- JavaScript errors in admin panel

### Issue 2: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- API requests fail from admin panel
- Network tab shows failed requests

**Solutions:**

1. **Check API Headers**
   All API endpoints should include:
   ```javascript
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
   ```

2. **Test CORS Preflight**
   ```bash
   curl -X OPTIONS http://localhost:3000/api/orders \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type"
   ```

### Issue 3: Admin Panel Authentication Issues

**Symptoms:**
- Password prompt appears repeatedly
- Cannot access admin panel
- Redirected to home page

**Solutions:**

1. **Use Correct Password**
   Default password: `sisters2024`

2. **Clear Browser Storage**
   ```javascript
   // In browser console
   localStorage.removeItem('admin_auth');
   ```

3. **Check Password in Code**
   Look for this line in `admin.html`:
   ```javascript
   if (password === 'sisters2024') {
   ```

### Issue 4: Orders API Returns 404

**Symptoms:**
- `/api/orders` returns 404
- Admin panel shows loading forever

**Solutions:**

1. **Check File Structure**
   Ensure these files exist:
   ```
   /api/orders.js
   /api/demo/add-order.js
   /api/demo/clear-orders.js
   ```

2. **Verify Vercel Configuration**
   Check `vercel.json` or ensure proper serverless function setup

3. **Test Direct API Access**
   ```bash
   curl -v http://localhost:3000/api/orders
   ```

### Issue 5: Demo Orders Not Persisting

**Symptoms:**
- Orders created but disappear after server restart
- Inconsistent order counts

**Explanation:**
This is expected behavior! The current system uses in-memory storage.

**Solutions:**

1. **For Testing:** This is normal - orders reset on server restart
2. **For Production:** Consider implementing persistent storage:
   - Vercel KV
   - External database
   - File-based storage

### Issue 6: JavaScript Errors in Admin Panel

**Symptoms:**
- Admin panel doesn't load properly
- Console shows JavaScript errors
- Buttons don't work

**Troubleshooting:**

1. **Check Browser Console**
   Open Developer Tools → Console tab

2. **Common Errors:**
   - `APP_CONFIG is not defined` → Check `config.js` loading
   - `fetch is not defined` → Browser compatibility issue
   - CORS errors → See Issue 2 above

3. **Test Config Loading**
   ```javascript
   // In browser console on admin page
   console.log(window.APP_CONFIG);
   ```

## Testing Workflow

### Step 1: Basic Connectivity
```bash
# Test server
curl http://localhost:3000/api/orders

# Should return: [] or array of orders
```

### Step 2: Create Test Order
```bash
# Use the comprehensive test script
node test-order-flow.js
```

### Step 3: Manual UI Testing
1. Open `http://localhost:3000/admin-demo.html`
2. Click "Small Order ($15)" button
3. Check for success message
4. Open `http://localhost:3000/admin.html`
5. Enter password: `sisters2024`
6. Verify order appears in table

### Step 4: API Verification
```bash
# Check orders via API
curl http://localhost:3000/api/orders | jq '.'
```

## Debug Information Collection

When reporting issues, please provide:

1. **Server Logs**
   ```bash
   # Run server with verbose logging
   npm run dev
   ```

2. **API Response**
   ```bash
   curl -v http://localhost:3000/api/orders
   ```

3. **Browser Console Errors**
   - Open Developer Tools
   - Check Console tab
   - Copy any error messages

4. **Network Tab**
   - Open Developer Tools
   - Go to Network tab
   - Refresh admin panel
   - Check for failed requests

## Environment-Specific Issues

### Development (localhost:3000)
- Uses `config.development.API_BASE_URL`
- CORS should be permissive
- Hot reloading may cause issues

### Production (Vercel)
- Uses `config.production.API_BASE_URL`
- Different CORS requirements
- Serverless function cold starts

## Quick Fixes

### Reset Everything
```bash
# Stop server
# Restart server
npm run dev

# Clear browser storage
# In browser console:
localStorage.clear();
sessionStorage.clear();
```

### Create Fresh Test Data
```bash
# Run test script
node test-order-flow.js

# Or use demo panel
# Open: http://localhost:3000/admin-demo.html
# Click: "Create 5 Random Orders"
```

### Clear All Orders
```bash
# Via API
curl -X POST http://localhost:3000/api/demo/clear-orders

# Or use demo panel
# Open: http://localhost:3000/admin-demo.html
# Click: "Clear All Orders"
```

## Advanced Debugging

### Enable Verbose Logging
Add to your API files:
```javascript
console.log('API called:', req.method, req.url);
console.log('Request body:', req.body);
console.log('Current orders:', orders.length);
```

### Monitor Order Array
Add to `orders.js`:
```javascript
setInterval(() => {
  console.log(`Current order count: ${orders.length}`);
}, 10000); // Log every 10 seconds
```

### Test Webhook Simulation
```bash
# Simulate Stripe webhook
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "metadata": {
          "customer_name": "Webhook Test",
          "customer_phone": "(555) 999-8888"
        },
        "customer_email": "webhook@test.com",
        "amount_total": 3500
      }
    }
  }'
```

## Contact Information

If you continue to have issues:
1. Run the comprehensive test: `node test-order-flow.js`
2. Collect the debug information listed above
3. Check the browser console for errors
4. Verify your server is running on the correct port

Remember: The current system uses in-memory storage, so orders will be lost when the server restarts. This is normal for development/testing!