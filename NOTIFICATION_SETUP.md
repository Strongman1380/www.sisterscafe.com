# 📧📱 Sisters Cafe Notification System Setup

## ✅ What's Implemented

Your Sisters Cafe system now automatically sends:

1. **📧 Email notifications** to `sisters806@gmail.com` for every new order
2. **📱 SMS notifications** to your restaurant phone for every new order  
3. **📱 Customer SMS confirmations** (if customer opted in)

## 🚀 Quick Start (Development Mode)

The system is already working in development mode! When you create test orders, you'll see notification previews in the console.

### Test It Now:
1. **Start the server:**
   ```bash
   cd "/Users/brandonhinrichs/Local Repositories/Sisters Cafe"
   node dev-server.js
   ```

2. **Create a test order:**
   - Go to: `http://localhost:3001/admin-demo.html`
   - Click any order button
   - Check the console for notification previews

3. **You'll see output like:**
   ```
   📧 EMAIL NOTIFICATION (Development Mode)
   ═══════════════════════════════════════
   To: sisters806@gmail.com
   Subject: 🍽️ New Order #SC123456 - $25.00 from John Doe
   
   Order Details:
   - Customer: John Doe
   - Phone: (555) 123-4567
   - Total: $25.00
   ...
   ```

## 🔧 Production Setup (Real Notifications)

To enable actual email and SMS sending, you need to:

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Gmail for Email Notifications

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Create an App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
4. **Edit `.env` file:**
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_APP_PASSWORD=your-16-character-app-password
   ```

### 3. Set Up Twilio for SMS Notifications

1. **Sign up at [twilio.com](https://twilio.com)**
2. **Get your credentials** from Twilio Console
3. **Add to `.env` file:**
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   RESTAURANT_PHONE=+1234567890
   ```

### 4. Update Webhook for Production

The webhook at `/api/webhook.js` is ready for production. When deployed to Vercel:
- Set environment variables in Vercel dashboard
- Configure Stripe webhook endpoint
- Real notifications will be sent automatically

## 📱 Notification Examples

### Email to Restaurant (sisters806@gmail.com)
```
Subject: 🍽️ New Order #SC123456 - $25.00 from John Doe

Order Details:
- Order ID: SC123456
- Customer: John Doe
- Phone: (555) 123-4567
- Email: john@example.com
- Total: $25.00
- Time: 12/4/2024, 3:30:00 PM

Items:
- Cheeseburger
- Fries
- Soda

Next Steps:
1. Prepare the order
2. Contact customer: (555) 123-4567
3. Customer will receive SMS updates
```

### SMS to Restaurant
```
🍽️ NEW ORDER - Sisters Cafe
Order #SC123456
Customer: John Doe
Phone: (555) 123-4567
Total: $25.00
Time: 3:30 PM

Please prepare order and contact customer if needed.
```

### SMS to Customer (if opted in)
```
Sisters Cafe: Thank you for your order #SC123456! We've received your order for $25.00 and will start preparing it shortly. You'll receive updates via SMS.
```

## 🧪 Testing

### Development Testing
```bash
# Start server
node dev-server.js

# Run automated tests
node test-order-flow.js

# Create test orders via demo panel
# Open: http://localhost:3001/admin-demo.html
```

### Production Testing
1. Deploy to Vercel with environment variables
2. Set up Stripe webhook endpoint
3. Make a real test purchase
4. Check email and SMS delivery

## 🔧 Configuration Options

### Environment Variables
```bash
# Required for email
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Required for SMS
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Restaurant contact
RESTAURANT_PHONE=+1234567890
RESTAURANT_EMAIL=sisters806@gmail.com

# Stripe (for production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Customization
- **Email template**: Edit `sendOrderEmail()` in `/api/webhook.js`
- **SMS messages**: Edit `sendOrderSMS()` and `sendCustomerSMS()` functions
- **Restaurant email**: Change `RESTAURANT_EMAIL` constant

## 🚨 Troubleshooting

### Email Issues
- ✅ Check Gmail app password is correct
- ✅ Verify 2-factor authentication is enabled
- ✅ Check spam folder

### SMS Issues  
- ✅ Verify Twilio credentials
- ✅ Check phone number format (+1234567890)
- ✅ Ensure Twilio account has sufficient balance

### Development Issues
- ✅ Check console for notification previews
- ✅ Verify server is running on port 3001
- ✅ Test with demo orders first

## 📊 Current Status

✅ **Email notifications**: Ready (development mode active)
✅ **SMS notifications**: Ready (development mode active)  
✅ **Customer confirmations**: Ready (development mode active)
✅ **Webhook integration**: Complete
✅ **Admin panel**: Removed (as requested)
✅ **Automatic processing**: Active

## 🎯 Next Steps

1. **Test in development**: Create demo orders and verify console output
2. **Set up production**: Configure Gmail and Twilio accounts
3. **Deploy**: Push to Vercel with environment variables
4. **Go live**: Configure Stripe webhook and start receiving real orders

Your notification system is ready to go! 🎉