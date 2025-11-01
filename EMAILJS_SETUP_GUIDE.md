# EmailJS Setup Guide for Sisters Cafe

This guide will help you set up EmailJS to receive order notifications at **sisters806@gmail.com**.

## What is EmailJS?

EmailJS allows you to send emails directly from JavaScript without needing a backend server. It's perfect for your Sisters Cafe ordering system!

## Step-by-Step Setup

### 1. Create an EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click "Sign Up" (it's free for up to 200 emails/month)
3. Create your account using **sisters806@gmail.com** or any email

### 2. Add an Email Service

1. Once logged in, go to **"Email Services"** in the left menu
2. Click **"Add New Service"**
3. Select **"Gmail"** as your email provider
4. Click **"Connect Account"**
5. Sign in with your **sisters806@gmail.com** Google account
6. Give EmailJS permission to send emails on your behalf
7. Give your service a name like "Sisters Cafe Orders"
8. Click **"Create Service"**
9. **IMPORTANT:** Copy the **Service ID** (looks like `service_xxxxxxx`)

### 3. Create an Email Template

1. Go to **"Email Templates"** in the left menu
2. Click **"Create New Template"**
3. Give it a name: "New Order Notification"
4. In the template editor, paste this HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #C46036 0%, #F4A259 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #fff; padding: 20px; border: 1px solid #E8DDD3; }
        .order-box { background: #FFF8F0; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #C46036; }
        .items-list { background: #f9f9f9; padding: 10px; border-radius: 4px; }
        .items-list ul { list-style: none; padding: 0; }
        .items-list li { padding: 8px; border-bottom: 1px solid #ddd; }
        .total { font-size: 1.3rem; font-weight: bold; color: #C46036; }
        .footer { background: #f5f5f5; padding: 15px; text-align: center; color: #666; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍽️ New Order Received!</h1>
        </div>
        <div class="content">
            <div class="order-box">
                <h2>Order #{{order_number}}</h2>
                <p><strong>📅 Date:</strong> {{order_date}}</p>
            </div>

            <h3>👤 Customer Information</h3>
            <p><strong>Name:</strong> {{customer_name}}</p>
            <p><strong>Phone:</strong> {{customer_phone}}</p>
            <p><strong>Email:</strong> {{customer_email}}</p>
            <p><strong>🕐 Pickup Time:</strong> {{pickup_time}}</p>

            <h3>🛒 Order Items</h3>
            <div class="items-list">
                <ul>
                    {{{order_items_html}}}
                </ul>
            </div>

            <div class="order-box">
                <p><strong>Subtotal:</strong> ${{subtotal}}</p>
                <p><strong>Tax (7.5%):</strong> ${{tax}}</p>
                <p class="total">TOTAL: ${{total}}</p>
            </div>

            <h3>📝 Special Instructions</h3>
            <p>{{order_notes}}</p>

            <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h3>✅ Next Steps</h3>
                <ol>
                    <li>Prepare the order for pickup at: <strong>{{pickup_time}}</strong></li>
                    <li>Call customer when ready: <strong>{{customer_phone}}</strong></li>
                    <li>Payment will be collected upon pickup (cash or card)</li>
                </ol>
            </div>
        </div>
        <div class="footer">
            <p>This email was automatically sent by Sisters Cafe Online Ordering System</p>
            <p>Order placed on {{order_date}}</p>
        </div>
    </div>
</body>
</html>
```

4. **IMPORTANT:** Copy the **Template ID** (looks like `template_xxxxxxx`)
5. Click **"Save"**

### 4. Get Your Public Key

1. Click on your profile/account icon in the top right
2. Go to **"Account"** → **"General"**
3. Find your **Public Key** (looks like a long random string)
4. **IMPORTANT:** Copy this key

### 5. Update Your Website Code

Now you need to add your keys to the website:

#### Option A: Update menu.html (Recommended)

1. Open `menu.html` in a text editor
2. Find this line (around line 374):
   ```javascript
   emailjs.init('YOUR_PUBLIC_KEY');
   ```
3. Replace `YOUR_PUBLIC_KEY` with your actual Public Key from step 4

#### Option B: Update menu-script.js

1. Open `menu-script.js` in a text editor
2. Find these lines (around line 690):
   ```javascript
   await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailParams);
   ```
3. Replace:
   - `YOUR_SERVICE_ID` with your Service ID from step 2
   - `YOUR_TEMPLATE_ID` with your Template ID from step 3

### 6. Test Your Setup

1. Open your website in a browser
2. Add some items to the cart
3. Click "Checkout"
4. Fill in the form with test data
5. Click "Submit Order"
6. Check **sisters806@gmail.com** inbox for the order email!

## Troubleshooting

### Not receiving emails?

1. **Check spam folder** - First emails might go to spam
2. **Verify EmailJS account** - Make sure you verified your email
3. **Check EmailJS Dashboard** - Go to EmailJS → "Email Logs" to see if emails are being sent
4. **Check browser console** - Press F12 in your browser and check for errors
5. **Verify keys** - Double-check all IDs and keys are entered correctly

### Email goes to spam?

1. In EmailJS, make sure Gmail is properly connected
2. Send a few test emails - email providers learn over time
3. Add your EmailJS sender address to contacts

### Need more emails?

The free plan includes 200 emails/month. For more:
- Upgrade to EmailJS paid plan (starts at $7/month for 1,000 emails)
- Or set up a different email service

## Security Notes

- Your EmailJS public key is safe to expose in client-side code
- Orders are sent directly from the customer's browser to EmailJS
- No sensitive data is stored on your server
- Consider adding Google reCAPTCHA if you get spam orders

## Support

- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: https://www.emailjs.com/support/
- Need help? Contact EmailJS support or check their FAQ

---

**That's it! Your email ordering system is now ready to go! 🎉**

When customers place orders, you'll receive beautifully formatted emails at sisters806@gmail.com with all the order details.
