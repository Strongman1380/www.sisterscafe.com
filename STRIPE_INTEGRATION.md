# Sisters Cafe - Stripe Integration

## Overview
The Sisters Cafe website now includes full Stripe payment integration for online ordering. When customers complete their order, they are redirected to Stripe Checkout for secure payment processing. After successful payment, an automated email is sent to Sisters Cafe with the complete order details.

## How It Works

### Customer Experience
1. Customer browses the menu and adds items to cart
2. Customer clicks "Checkout" 
3. Customer fills out their information (name, phone, email, pickup time, special instructions)
4. Customer clicks "Pay Now" 
5. Customer is redirected to Stripe Checkout for secure payment
6. After successful payment, customer is redirected to success page
7. Customer receives confirmation and Sisters Cafe is automatically notified

### Restaurant Experience
1. Automatic email notification sent to sisters806@gmail.com with:
   - Complete order details and items
   - Customer contact information
   - Pickup time and special instructions
   - Payment confirmation
   - Order total and payment status

## Files Modified/Created

### New Files
- `success.html` - Success page after payment
- `cancel.html` - Cancel page if payment is cancelled
- `.env` - Environment configuration (you need to add your Stripe secret key)

### Modified Files
- `menu.html` - Added email field and SMS notifications option
- `menu-script.js` - Integrated Stripe checkout instead of manual order submission
- `api/webhook.js` - Enhanced to retrieve order items and send detailed emails
- `api/create-checkout-session.js` - Updated to pass customer metadata
- `config.js` - Already had Stripe publishable key configured

## Setup Requirements

### 1. Environment Variables
Update your `.env` file with your actual Stripe secret key:
```
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
```

### 2. Email Configuration
Make sure your Gmail app password is configured in `.env`:
```
EMAIL_USER=sisters806@gmail.com
EMAIL_APP_PASSWORD=your_actual_gmail_app_password
```

### 3. Webhook Configuration
In your Stripe dashboard, set up a webhook endpoint pointing to:
- Development: `http://localhost:3001/api/webhook`
- Production: `https://yourdomain.com/api/webhook`

## Testing

### Development Testing
1. Start the development server: `npm run dev`
2. Open `http://localhost:3001/menu.html`
3. Add items to cart and proceed to checkout
4. Use Stripe test card numbers (e.g., 4242 4242 4242 4242)
5. Check console for email notification preview

### Automated Demo Session

Run `npm run stripe:demo` to create a fresh Stripe Checkout session from the command line. The script reads your `.env` file, calls the same handler used in production, and prints a one-time checkout URL you can open in the browser for verification.

Environment variables used by the demo:
- `STRIPE_SECRET_KEY` – required; pulled from `.env`
- `DEMO_HOST`/`DEMO_PROTOCOL` – optional overrides for the generated success/cancel URLs
- `DEMO_CUSTOMER_*` – optional custom name/phone/email for the demo order metadata

### Test Card Numbers
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Requires authentication: 4000 0025 0000 3155

## Features

### Order Processing
- ✅ Secure Stripe payment processing
- ✅ Automatic email notifications to restaurant
- ✅ Order details include all items, quantities, and totals
- ✅ Customer contact information captured
- ✅ Pickup time and special instructions included
- ✅ SMS notification opt-in for customers

### Email Notifications
- ✅ Professional HTML email format
- ✅ Complete order breakdown
- ✅ Customer contact information
- ✅ Pickup time and special instructions
- ✅ Payment confirmation
- ✅ Next steps for restaurant staff

### Customer Experience
- ✅ Clean, professional checkout flow
- ✅ Secure payment processing via Stripe
- ✅ Success/cancel pages with clear messaging
- ✅ Order confirmation with details
- ✅ Option for SMS notifications

## Production Deployment

When deploying to production:
1. Update `.env` with production Stripe keys
2. Configure webhook endpoint in Stripe dashboard
3. Test with small amounts first
4. Monitor email delivery and webhook processing

## Support

For issues with the Stripe integration:
1. Check the browser console for JavaScript errors
2. Check server logs for API errors
3. Verify webhook is receiving events in Stripe dashboard
4. Test email delivery with development server first
