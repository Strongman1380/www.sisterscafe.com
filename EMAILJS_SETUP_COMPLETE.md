# EmailJS Setup Guide for Sisters Cafe

This guide will walk you through setting up email notifications for online orders.

## 📧 What This Does

When a customer submits an order through the website, an email will be automatically sent to **sisterscafe28@gmail.com** with:
- Customer's contact information
- Complete order details (items, quantities, prices)
- Pickup time
- Special instructions
- Order total with tax
- Professional invoice-style formatting

---

## 🚀 Step-by-Step Setup

### Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (it's FREE - no credit card required)
3. Create account with your email

### Step 2: Add Email Service

1. In EmailJS dashboard, click **"Add New Service"**
2. Choose **Gmail** (recommended) or your preferred email provider
3. Click **"Connect Account"**
4. Sign in with **sisterscafe28@gmail.com**
5. Allow EmailJS to send emails on your behalf
6. Note down the **Service ID** (example: `service_abc123`)

### Step 3: Create Email Template

1. In EmailJS dashboard, click **"Email Templates"**
2. Click **"Create New Template"**
3. Template Settings:
   - **Template Name**: `Sisters Cafe Order Notification`
   - **Subject**: `🍽️ New Order #{{order_number}} - {{customer_name}}`
   - **To Email**: `sisterscafe28@gmail.com` (or use `{{to_email}}`)

4. **Content Tab**:
   - Switch to **HTML** mode (toggle button)
   - Open the file `EMAILJS_TEMPLATE.html` in this folder
   - Copy the ENTIRE contents
   - Paste into EmailJS Content field
   - Click **"Save"**

5. Note down the **Template ID** (example: `template_xyz789`)

### Step 4: Get Your Public Key

1. In EmailJS dashboard, click on your account name (top right)
2. Go to **"Account"** → **"General"**
3. Find **"Public Key"** (example: `AbCdEf123456789`)
4. Copy this key

### Step 5: Update Website Code

Open `menu.html` and find line ~374:

**BEFORE:**
```javascript
emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS public key
```

**AFTER:**
```javascript
emailjs.init('AbCdEf123456789'); // Your actual public key
```

---

Open `menu-script.js` and find line ~666:

**BEFORE:**
```javascript
const SERVICE_ID = 'YOUR_SERVICE_ID';
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
```

**AFTER:**
```javascript
const SERVICE_ID = 'service_abc123';  // Your actual service ID
const TEMPLATE_ID = 'template_xyz789'; // Your actual template ID
```

### Step 6: Test It!

1. Save all files
2. Refresh the website (hard refresh: `Ctrl + Shift + R` or `Cmd + Shift + R`)
3. Add items to cart
4. Go to checkout
5. Fill in the form with test data
6. Click "Submit Order"
7. Check **sisterscafe28@gmail.com** inbox - you should receive a beautiful order email!

---

## 🎨 Email Preview

The email will look like this:

```
┌─────────────────────────────────────────┐
│         SISTERS CAFE                     │
│     ~ New Order Received ~               │
├─────────────────────────────────────────┤
│      Order #SC12345678                   │
│   Placed on 10/31/2025, 10:30 AM        │
├─────────────────────────────────────────┤
│                                          │
│  👋 New order from John Doe!            │
│                                          │
│  📋 Customer Information                 │
│  Name: John Doe                          │
│  Phone: (402) 555-1234                   │
│  Email: john@example.com                 │
│  🕐 Pickup Time: ASAP (20-30 min)       │
│                                          │
│  🍽️ Order Items                         │
│  • Breakfast Burrito x 2 = $21.90       │
│  • Coffee x 1 = $2.50                    │
│                                          │
│  Subtotal: $24.40                        │
│  Tax (7.5%): $1.83                       │
│  TOTAL: $26.23                           │
│                                          │
│  💬 Special Instructions:                │
│  Extra salsa, please!                    │
│                                          │
│  💰 Payment: Cash/card at pickup         │
│                                          │
├─────────────────────────────────────────┤
│         Sisters Cafe                     │
│       📍 402-759-4144                    │
│  Open Mon-Sat: 6AM–2PM                  │
│  ~ Made with love in our                │
│    small-town cafe ~                     │
└─────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] EmailJS account created
- [ ] Gmail service connected
- [ ] Email template created with HTML
- [ ] Public key added to `menu.html`
- [ ] Service ID and Template ID added to `menu-script.js`
- [ ] Test order submitted successfully
- [ ] Email received at sisterscafe28@gmail.com
- [ ] Email displays correctly (check on phone too!)

---

## 🆓 Free Plan Limits

EmailJS free plan includes:
- ✅ 200 emails per month
- ✅ Unlimited templates
- ✅ All features included

If you need more than 200 orders/month, you can upgrade for $15/month.

---

## 🛠️ Troubleshooting

### Email not received?

1. **Check spam/junk folder** - Sometimes first email goes to spam
2. **Check EmailJS dashboard** → **"Email Log"** to see if email was sent
3. **Verify Service ID and Template ID** are correct in `menu-script.js`
4. **Check browser console** for error messages

### Email looks broken?

1. Make sure you copied the **ENTIRE** HTML template
2. Verify you're in **HTML mode** (not plain text) in EmailJS
3. Test sending from EmailJS dashboard directly

### "Error submitting order"?

1. Make sure Public Key is correct in `menu.html`
2. Hard refresh browser to clear cache
3. Check browser console for specific error

---

## 📞 Support

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- Test email sending: EmailJS Dashboard → Test Template
- Need help? Check the browser console for error messages

---

## 🎉 You're All Set!

Once configured, every order will automatically send a beautiful, professional email to Sisters Cafe. The customer will see a success message, and you'll get all the order details in your inbox!

**No monthly fees. No complicated setup. Just simple, reliable order notifications.** ☕
