# Email Configuration Fix Guide for Sisters Cafe

## Problem
The dev server shows: "Email transporter setup failed, will show previews only"

This means nodemailer is trying to send emails but the Gmail configuration isn't working.

---

## Solution: Generate Gmail App Password

Gmail requires apps to use a special "app password" instead of your regular password for security.

### Step 1: Enable 2-Factor Authentication (if not already done)
1. Go to https://myaccount.google.com/security
2. Look for "2-Step Verification"
3. If not enabled, click it and set up:
   - Add a phone number
   - Verify with code
   - Save backup codes

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. **Important:** Make sure you're logged into the Google account: **sisters806@gmail.com**
3. If you don't see "App passwords" option:
   - You need to set up 2-Step Verification first (Step 1)
   - Return here after enabling it
4. Select:
   - **App**: "Mail"
   - **Device**: "Other (custom name)" → type "Sisters Cafe"
5. Click **Generate**
6. Google will show a 16-character password
7. Copy the entire password (just the code, no spaces)

### Step 3: Update .env File

**BEFORE:**
```
EMAIL_USER=sisters806@gmail.com
EMAIL_APP_PASSWORD=BAseBAll!#80
```

**AFTER (example):**
```
EMAIL_USER=sisters806@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop
```

Replace `abcdefghijklmnop` with the actual 16-character code from Step 2.

### Step 4: Restart Server
```bash
# Stop current server (Ctrl+C in terminal)
npm start
```

You should now see:
```
✅ Email notifications to: sisters806@gmail.com
```

Instead of:
```
⚠️ Email transporter setup failed
```

---

## Verify It's Working

### Option A: Create a test order
```bash
curl -X POST http://localhost:3001/api/demo/add-order \
  -H "Content-Type: application/json" \
  -d '{
    "id":"TEST123",
    "customer_name":"Test Customer",
    "customer_phone":"402-759-4144",
    "customer_email":"test@example.com",
    "amount_total":2500,
    "status":"paid",
    "items":["Test Sandwich x1","Drink x1"]
  }'
```

### Option B: Test via website
1. Go to http://localhost:3001/menu.html
2. Add items to cart
3. Click Checkout
4. Fill in form
5. Use test card: **4242 4242 4242 4242**
6. Complete payment

### Where to Check:
- Check **sisters806@gmail.com** inbox for the email
- If email still fails, check console output for error message

---

## Email Format

When working correctly, customers will receive this automated email after payment:

```
FROM: sisters806@gmail.com
TO: sisters806@gmail.com
SUBJECT: 🍽️ New Order #SC123456 - $25.50 from John Smith

EMAIL BODY:
- Order ID
- Customer name, phone, email
- Items ordered with quantities
- Pickup time
- Special instructions
- Total amount paid
- Payment status: ✅ PAID
- Next steps for restaurant staff
```

---

## Troubleshooting

### Still not working after following steps?

**1. Check Gmail account access:**
- Verify you can log in to sisters806@gmail.com
- Check if account is active and email works

**2. Verify app password is correct:**
- Go back to https://myaccount.google.com/apppasswords
- Delete old "Sisters Cafe" app password
- Generate a NEW one
- Copy the entire 16-character code (no spaces)
- Paste into `.env` exactly as shown

**3. Check if 2FA is actually enabled:**
- Go to https://myaccount.google.com/security
- Verify "2-Step Verification" shows as "On"

**4. Try a different approach:**
If app passwords don't work, you can use an "investment password" (less secure but works):
- Go to Account Settings
- Security
- Allow "Less secure app access"
- Use regular password (not recommended long-term)

### Error still appears?

1. **Restart terminal completely** - Close and reopen terminal
2. **Clear npm cache** - `npm cache clean --force`
3. **Reinstall dependencies** - Delete `node_modules`, run `npm install`
4. **Check .env format** - Ensure no extra spaces or quotes

---

## Security Notes

✅ **Safe to do:**
- Generate app passwords
- Enable 2-Step Verification
- Use app passwords in .env file

❌ **Never do:**
- Share .env file publicly
- Commit .env to GitHub
- Use same password for multiple apps
- Share app password via email/chat

---

## Next Steps

Once email is working:

1. ✅ Test email notifications
2. ✅ Configure Stripe webhook secret (see STRIPE_INTEGRATION.md)
3. ✅ Deploy to production
4. ✅ Switch to production Stripe keys
5. ✅ Monitor first real orders

---

## Need Help?

If you get stuck:
1. Check console output for the exact error message
2. Verify Gmail account (sisters806@gmail.com) is accessible
3. Double-check app password has no spaces
4. Make sure you're using the correct Gmail account

Questions? Refer to:
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- Nodemailer Gmail Setup: https://nodemailer.com/smtp/gmail/
