# Sisters Cafe Admin Panel

## Overview
The admin panel provides real-time order management for Sisters Cafe, allowing staff to view, track, and update order statuses.

## Features
- **Real-time Order Dashboard**: View all orders with customer details, items, and amounts
- **Order Status Management**: Update order status (Paid → Preparing → Ready → Completed)
- **Live Statistics**: Total orders, revenue, and pending orders
- **Auto-refresh**: Orders refresh every 30 seconds automatically
- **Demo System**: Test the admin panel with sample orders

## Files Structure
```
admin.html              # Main admin panel interface
admin-demo.html         # Demo system for testing
config.js              # API configuration
api/orders.js          # Orders API endpoint
api/orders/[id]/status.js  # Order status update endpoint
api/webhook.js         # Stripe webhook handler (creates orders)
api/demo/add-order.js  # Demo order creation
api/demo/clear-orders.js  # Demo order cleanup
```

## How It Works

### Order Creation Flow
1. Customer places order on website
2. Stripe processes payment
3. Webhook receives payment confirmation
4. Order is added to orders array
5. Admin panel displays new order automatically

### Order Management
1. Orders appear in admin panel immediately
2. Staff can update status: Paid → Preparing → Ready → Completed
3. Status updates are saved and reflected in real-time
4. Statistics update automatically

## Access
- **URL**: `/admin.html`
- **Password**: `sisters2024` (change this in production!)
- **Demo**: `/admin-demo.html`

## Demo System
The demo system allows you to test the admin panel without processing real payments:

1. Go to `/admin-demo.html`
2. Click buttons to create sample orders
3. Open admin panel to see orders appear
4. Test status updates and functionality
5. Clear demo orders when done

## API Endpoints

### GET /api/orders
Returns all orders sorted by creation date (newest first)

### POST /api/orders/[id]/status
Updates order status
```json
{
  "status": "preparing"
}
```

### POST /api/demo/add-order
Creates a demo order (for testing)

### POST /api/demo/clear-orders
Removes all demo orders

## Security Notes
- Change the default password in production
- Consider adding proper authentication
- Webhook endpoint should be secured with Stripe signature verification
- In production, use a proper database instead of in-memory storage

## Customization
- Modify order statuses in the admin.html file
- Adjust auto-refresh interval (currently 30 seconds)
- Customize styling and layout as needed
- Add additional order fields or customer information

## Troubleshooting

### Orders not appearing
1. Check if webhook is properly configured in Stripe
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Ensure config.js has correct API base URL

### Status updates not working
1. Check network tab for failed API calls
2. Verify order ID is correct
3. Check server logs for errors

### Demo not working
1. Ensure demo API endpoints are deployed
2. Check config.js configuration
3. Verify CORS headers are set correctly