# 🚀 Quick Start Guide - New Email Ordering System

## ⚡ Get Started in 3 Steps!

### Step 1: Set Up EmailJS (15 minutes)

1. Go to [EmailJS.com](https://www.emailjs.com/) and sign up
2. Connect your Gmail (sisters806@gmail.com)
3. Create an email template (copy from EMAILJS_SETUP_GUIDE.md)
4. Get your 3 keys:
   - Public Key
   - Service ID
   - Template ID

### Step 2: Update Your Website

**Open `menu.html` and find line 374:**

```javascript
emailjs.init('YOUR_PUBLIC_KEY');
```

**Replace with your actual key from EmailJS.**

**Then find `menu-script.js` line 690:**

```javascript
await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailParams);
```

**Replace both IDs with your actual IDs from EmailJS.**

### Step 3: Test It!

1. Open your website
2. Add an item to cart
3. Click Checkout
4. Fill the form with test data
5. Submit order
6. Check sisters806@gmail.com inbox!

---

## 🎨 What You'll See

### New Colors
- Warm terracotta and golden yellow
- Fresh sage green accents
- Cozy cream backgrounds

### New Features
- Animated buttons with ripple effects
- Smooth hover animations
- Beautiful order confirmations
- Email notifications to your inbox

### Simplified Checkout
- No more payment processing
- Simple form: name, phone, email, pickup time
- Customers pay at pickup (cash or card)
- Instant order confirmation

---

## 📧 How Orders Work Now

1. **Customer orders** → Fills simple form
2. **Email sent** → You receive order at sisters806@gmail.com
3. **You prepare** → Make the food
4. **Customer picks up** → They pay at cafe
5. **Done!** → Simple and fast!

---

## ⚠️ Important Notes

- **Free Plan:** 200 emails/month (plenty for a cafe!)
- **Payment:** Customers pay AT PICKUP (no online payment)
- **Test First:** Send yourself a test order before going live
- **Check Spam:** First emails might go to spam folder

---

## 📚 Full Documentation

For detailed setup instructions, see:
- **EMAILJS_SETUP_GUIDE.md** - Complete EmailJS setup
- **ENHANCEMENT_SUMMARY.md** - All changes explained

---

## 🆘 Need Help?

**Email not sending?**
1. Check browser console (press F12)
2. Verify all 3 keys are correct
3. Check EmailJS dashboard for errors

**Still stuck?**
- Review EMAILJS_SETUP_GUIDE.md
- Contact EmailJS support
- Check that Gmail is connected in EmailJS

---

## ✅ Checklist

- [ ] Created EmailJS account
- [ ] Connected Gmail (sisters806@gmail.com)
- [ ] Created email template
- [ ] Got Public Key, Service ID, Template ID
- [ ] Updated menu.html with Public Key
- [ ] Updated menu-script.js with Service ID and Template ID
- [ ] Tested with a real order
- [ ] Received test email successfully
- [ ] Website is live and ready!

---

**That's it! You're ready to receive orders! 🎉**
