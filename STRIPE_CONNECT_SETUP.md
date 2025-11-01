# Stripe Connect Integration Setup Guide

## 🚀 Overview

This guide will help you set up the Stripe Connect integration for Sisters Cafe. The integration includes:

- **Connected Account Management**: Create and onboard merchant accounts
- **Product Management**: Create products at the platform level
- **Marketplace Storefront**: Customer-facing product catalog
- **Destination Charges**: Process payments with application fees
- **Express Dashboard**: Give merchants access to account management

## 📋 Prerequisites

1. **Stripe Account**: You need a Stripe account with Connect enabled
2. **API Keys**: Both test and live API keys from your Stripe dashboard
3. **Environment Variables**: Properly configured environment file

## 🔧 Configuration

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your Stripe credentials:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
# Application fee percentage (e.g., 0.05 for 5%)
STRIPE_APPLICATION_FEE_PERCENT=0.05
```

### 2. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Copy your **Publishable key** and **Secret key**
4. For webhooks, go to **Developers** → **Webhooks** and create an endpoint

### 3. Enable Stripe Connect

1. In your Stripe Dashboard, go to **Connect** → **Settings**
2. Enable Connect for your account
3. Configure your platform settings

## 🏗️ API Endpoints

The integration includes the following API endpoints:

### Connected Accounts
- `POST /api/connect/accounts` - Create a new connected account
- `GET /api/connect/accounts?account_id=acct_xxx` - Retrieve account information

### Account Links (Onboarding)
- `POST /api/connect/account-links` - Create onboarding links

### Products
- `POST /api/connect/products` - Create a new product
- `GET /api/connect/products` - List all products

### Checkout
- `POST /api/connect/checkout` - Create checkout session with destination charges

## 🎯 Usage Flow

### 1. Create Connected Accounts

```javascript
// Create a connected account
const response = await fetch('/api/connect/accounts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'merchant@example.com',
    business_name: 'Joe\'s Pizza',
    country: 'US'
  })
});

const result = await response.json();
console.log('Account created:', result.account.id);
```

### 2. Onboard Connected Accounts

```javascript
// Create onboarding link
const response = await fetch('/api/connect/account-links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    account_id: 'acct_1234567890',
    return_url: 'https://yoursite.com/connect/onboarding-complete',
    refresh_url: 'https://yoursite.com/connect-dashboard.html'
  })
});

const result = await response.json();
// Redirect user to result.account_link.url
window.location.href = result.account_link.url;
```

### 3. Create Products

```javascript
// Create a product for a connected account
const response = await fetch('/api/connect/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, and basil',
    price_in_cents: 1500, // $15.00
    connected_account_id: 'acct_1234567890'
  })
});

const result = await response.json();
console.log('Product created:', result.product.id);
```

### 4. Process Payments

```javascript
// Create checkout session with destination charge
const response = await fetch('/api/connect/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{
      price_id: 'price_1234567890',
      quantity: 1,
      connected_account_id: 'acct_1234567890'
    }],
    success_url: 'https://yoursite.com/connect/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://yoursite.com/connect-storefront.html'
  })
});

const result = await response.json();
// Redirect to Stripe Checkout
window.location.href = result.checkout_session.url;
```

## 🖥️ User Interface

### Admin Dashboard (`connect-dashboard.html`)
- Create and manage connected accounts
- View onboarding status
- Create products for merchants
- Monitor account health

### Customer Storefront (`connect-storefront.html`)
- Browse products from all merchants
- Add items to cart
- Checkout with Stripe

### Success Pages
- Payment success confirmation
- Onboarding completion confirmation

## 💰 Revenue Model

The integration uses **destination charges** with application fees:

1. **Customer pays full amount** to your platform
2. **Platform keeps application fee** (configurable percentage)
3. **Remaining funds transferred** to connected account
4. **Platform handles disputes** and chargebacks

Example with 5% application fee:
- Customer pays: $100.00
- Platform keeps: $5.00 (5%)
- Merchant receives: $95.00

## 🔒 Security Features

### Account Controller Configuration
```javascript
// Platform controls pricing and fees
controller: {
  fees: { payer: 'application' },
  losses: { payments: 'application' },
  stripe_dashboard: { type: 'express' }
}
```

### API Validation
- Required field validation
- Account status verification
- Price validation
- Error handling with helpful messages

## 🧪 Testing

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test the Flow
1. Open `http://localhost:3000/connect-dashboard.html`
2. Create a test connected account
3. Complete onboarding (use Stripe test data)
4. Create test products
5. Visit storefront and make test purchases

### 3. Test Data
Use Stripe's test data for onboarding:
- **SSN**: `000-00-0000`
- **Phone**: `000-000-0000`
- **Bank Account**: `000123456789` (routing: `110000000`)

## 🚀 Production Deployment

### 1. Environment Setup
- Set production Stripe keys
- Configure webhook endpoints
- Set proper return URLs

### 2. Webhook Configuration
Create webhooks for these events:
- `checkout.session.completed`
- `account.updated`
- `payment_intent.succeeded`

### 3. Database Migration
Replace in-memory storage with persistent database:
```javascript
// Replace this in-memory storage:
let productAccountMappings = [];

// With database storage:
// PostgreSQL, MongoDB, or Vercel KV
```

## 📊 Monitoring

### Key Metrics to Track
- Connected account creation rate
- Onboarding completion rate
- Product creation volume
- Transaction success rate
- Application fee revenue

### Logging
All API endpoints include comprehensive logging:
```javascript
console.log('✅ Account created:', account.id);
console.log('💳 Checkout session created:', session.id);
console.log('🛍️ Product created:', product.id);
```

## 🔧 Customization

### Styling
The UI uses CSS custom properties for easy theming:
```css
:root {
  --primary-color: #8b2c00;
  --primary-light: #a23e14;
  --primary-dark: #6a2100;
}
```

### Application Fee
Adjust the fee percentage in your environment:
```bash
STRIPE_APPLICATION_FEE_PERCENT=0.03  # 3%
```

### Supported Countries
Add more countries in the account creation form:
```javascript
<option value="FR">France</option>
<option value="DE">Germany</option>
<option value="JP">Japan</option>
```

## 🆘 Troubleshooting

### Common Issues

1. **"Account not ready for products"**
   - Ensure connected account completed onboarding
   - Check `charges_enabled` status

2. **"Multi-merchant checkout not supported"**
   - Current demo only supports single-merchant carts
   - Implement cart splitting for multi-merchant support

3. **"Webhook signature verification failed"**
   - Verify `STRIPE_WEBHOOK_SECRET` is correct
   - Check webhook endpoint URL

### Debug Mode
Enable verbose logging by adding to API files:
```javascript
console.log('Request body:', req.body);
console.log('Account status:', account);
```

## 📚 Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Destination Charges Guide](https://stripe.com/docs/connect/destination-charges)
- [Express Dashboard](https://stripe.com/docs/connect/express-dashboard)
- [Account Links](https://stripe.com/docs/connect/account-links)

## 🎉 Next Steps

1. **Test the integration** with the provided UI
2. **Customize the styling** to match your brand
3. **Add database persistence** for production
4. **Implement additional features** like refunds, disputes
5. **Monitor performance** and optimize as needed

The integration is now ready to use! Visit `connect-dashboard.html` to start creating connected accounts and products.