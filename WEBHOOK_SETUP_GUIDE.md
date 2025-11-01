# Stripe Webhook Configuration Guide

## What is a Webhook?

A webhook is how Stripe tells your server: **"Hey! Someone paid! Process the order!"**

Without it: Your server doesn't know when payments succeed
With it: Your server automatically creates orders and sends notifications

---

## Why You Need It

When customer completes Stripe checkout:
1. Stripe processes payment
2. **Stripe sends webhook** → Your server
3. Your server creates order
4. Your server sends email notification
5. Customer sees success page

**Without webhook:** Order is never created, no emails sent ❌
**With webhook:** Everything happens automatically ✅

---

## Step-by-Step Setup

### For Development (Local Testing)

**Problem:** Stripe can't reach your local computer (localhost:3001)

**Solutions:**

#### Option A: Using Stripe CLI (Recommended for Testing)

```bash
# 1. Install Stripe CLI
# Visit: https://stripe.com/docs/stripe-cli
# (macOS: brew install stripe/stripe-cli/stripe)

# 2. Login to Stripe
stripe login
# Opens browser to authenticate

# 3. Forward webhooks to your local server
stripe listen --forward-to localhost:3001/api/webhook

# Output will show:
# Webhook signing secret: whsec_xxxxxxxxxx
# Ready! Your webhook signing secret is: whsec_xxxxxxxxxx
```

4. Copy the signing secret
5. Update `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
   ```

6. Restart server: `Ctrl+C` then `npm start`

Now when you make a test payment, the webhook will trigger locally! ✅

---

### For Production (After Deploying)

**Your domain must be publicly accessible (not localhost)**

#### Step 1: Access Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Login with your Stripe account
3. Click **Developers** (top right)
4. Click **Webhooks** (left sidebar)

#### Step 2: Create Webhook Endpoint
1. Click **Add endpoint**
2. Enter your endpoint URL:
   ```
   https://yourdomain.com/api/webhook
   ```
   Replace `yourdomain.com` with your actual domain

3. Select **Events to send:**
   - Check: `checkout.session.completed`
   - Check: `payment_intent.succeeded`
   - Uncheck others (optional but keeps it clean)

4. Click **Add endpoint**

#### Step 3: Copy Signing Secret
1. Find your new endpoint in the list
2. Click the **Reveal** button next to "Signing secret"
3. Copy the secret (starts with `whsec_`)

#### Step 4: Update .env
```properties
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

#### Step 5: Deploy & Restart
1. Commit changes to GitHub
2. Deploy to Vercel/hosting
3. Set `.env` on production server
4. Restart server

Now production payments will trigger webhooks! ✅

---

## Testing Webhook

### Option 1: Stripe CLI (Easiest)
```bash
# With Stripe CLI running, make a test payment:
# 1. Go to http://localhost:3001/menu.html
# 2. Add item, checkout
# 3. Use card: 4242 4242 4242 4242
# 4. Complete payment
# 5. Watch terminal for webhook event:
#    ↓ 2024-01-15 10:30:42 checkout.session.completed
```

### Option 2: Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Developers → Webhooks
3. Click your endpoint
4. Click **Send test event**
5. Select `checkout.session.completed`
6. Click **Send event**
7. Check your app console/logs

### Option 3: Manual Test via API
```bash
# Create test payment via API
curl -X POST http://localhost:3001/api/demo/add-order \
  -H "Content-Type: application/json" \
  -d '{
    "id":"TEST123",
    "customer_name":"Brandon",
    "customer_phone":"402-759-4144",
    "customer_email":"brandon@example.com",
    "amount_total":2500,
    "status":"paid",
    "items":["Sandwich x2"]
  }'
```

---

## What Happens When Webhook Fires

### Your Server Receives:
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_xxxxx",
      "customer_email": "brandon@example.com",
      "metadata": {
        "customer_name": "Brandon",
        "customer_phone": "402-759-4144",
        "pickup_time": "In 30 minutes",
        "order_notes": "No onions"
      }
    }
  }
}
```

### Your Server Does:
1. ✅ Verifies webhook signature (secure)
2. ✅ Creates order record
3. ✅ Retrieves line items from Stripe
4. ✅ Sends email to sisters806@gmail.com
5. ✅ Sends SMS to restaurant (if configured)
6. ✅ Sends SMS to customer (if they opted in)

**Result:** Automatic order processing ✨

---

## Troubleshooting

### "Webhook is not being called"

**Check 1: Is webhook URL correct?**
```bash
# Development - Use Stripe CLI
stripe listen --forward-to localhost:3001/api/webhook

# Production - Check in Stripe Dashboard
# Developers → Webhooks → Your endpoint
# Should show: https://yourdomain.com/api/webhook
```

**Check 2: Is webhook secret in .env?**
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
# Not: whsec_your_webhook_secret_here
```

**Check 3: Is server running?**
```bash
npm start
# Should show: "Server running at http://localhost:3001"
```

**Check 4: Check webhook logs**
```bash
# In Stripe Dashboard:
# Developers → Webhooks → Your endpoint
# Scroll down to "Events"
# Shows recent webhook calls with status
```

### "Webhook was received but no email sent"

**Check:** Email configuration (See EMAIL_SETUP_GUIDE.md)

```bash
# Start server and watch output:
npm start
# Should show: ✅ Email notifications to: sisters806@gmail.com
# Not: ⚠️ Email transporter setup failed
```

### "Webhook shows error in Stripe"

**Check server logs:**
```bash
# Look at terminal running `npm start`
# Should show error message with details
```

**Common issues:**
- Endpoint URL is wrong
- Server is down
- Webhook secret mismatch
- JSON parsing error

---

## Security

### Webhook Signature Verification
Your app **ALWAYS** verifies the webhook came from Stripe:

```javascript
// From api/webhook.js
const sig = req.headers['stripe-signature'];
event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
```

This prevents malicious actors from:
- ❌ Creating fake orders
- ❌ Sending fake payments
- ❌ Manipulating amounts

### Secret Key Security
- ✅ `STRIPE_WEBHOOK_SECRET` - Safe to use server-side
- ✅ Never share this secret
- ✅ Never commit to GitHub (use .env)
- ✅ Rotate secrets periodically in production

---

## Integration in Your App

### When does webhook run?

**api/webhook.js** automatically:

1. **Receives** webhook from Stripe
2. **Verifies** signature (ensures it's real)
3. **Gets** order details from Stripe
4. **Creates** order in your database
5. **Sends** email notification
6. **Sends** SMS notification (optional)
7. **Returns** success to Stripe

**Code location:** `/api/webhook.js` (already set up!)

---

## Checklist

### Development Setup
- [ ] Install Stripe CLI
- [ ] Run `stripe login`
- [ ] Run `stripe listen --forward-to localhost:3001/api/webhook`
- [ ] Copy signing secret from CLI output
- [ ] Update `.env` with secret
- [ ] Restart `npm start`
- [ ] Test with payment

### Production Setup
- [ ] Deploy app to domain
- [ ] Go to https://dashboard.stripe.com
- [ ] Create webhook endpoint
- [ ] Add production domain: `https://yourdomain.com/api/webhook`
- [ ] Copy signing secret
- [ ] Update production `.env`
- [ ] Restart production server
- [ ] Test with payment

---

## Resources

- **Stripe Webhooks Docs:** https://stripe.com/docs/webhooks
- **Stripe CLI Setup:** https://stripe.com/docs/stripe-cli
- **Webhook Events:** https://stripe.com/docs/api/events
- **Security Best Practices:** https://stripe.com/docs/webhooks/best-practices

---

## Next Steps

1. ✅ Set up webhook for development (Stripe CLI)
2. ✅ Test checkout flow with webhook
3. ✅ Verify email notifications work
4. ✅ Deploy to production
5. ✅ Set up production webhook
6. ✅ Go live!

Need help? See:
- **QUICK_START.md** - Fast setup
- **EMAIL_SETUP_GUIDE.md** - Email fixes
- **PAYMENT_SOLUTIONS_ANALYSIS.md** - Full overview
