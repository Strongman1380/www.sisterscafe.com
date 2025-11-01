---
description: Repository Information Overview
alwaysApply: true
---

# Sisters Cafe Information

## Summary
Sisters Cafe is an online ordering system with automatic notifications for a restaurant. It includes a web interface for customers to place orders, a payment processing system using Stripe, and an automatic notification system that sends email and SMS alerts for new orders.

## Structure
- **api/**: API endpoints for order processing, Stripe integration, and Connect functionality
- **serverless/**: Serverless functions for SMS notifications
- **Communication Website/**: Separate website for communication purposes
- **images/**: Image assets for the website
- **connect/**: Stripe Connect integration files
- **.env.example**: Template for environment variables
- **dev-server.js**: Development server with notification system
- **twilio-service.js**: SMS notification service
- **test-notifications.js**: Testing script for notification system

## Language & Runtime
**Language**: JavaScript (Node.js)
**Version**: Node.js >= 16.0.0
**Build System**: npm
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- stripe (^14.0.0): Payment processing
- nodemailer (^6.9.0): Email notifications
- twilio (^4.19.0): SMS notifications
- @notionhq/client (^2.2.15): Notion integration

**Development Dependencies**:
- dotenv (^16.3.0): Environment variable management

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test notification system
npm test
```

## Testing
**Framework**: Custom testing scripts
**Test Location**: Root directory (test-notifications.js)
**Run Command**:
```bash
# Run notification tests
node test-notifications.js

# Create test order via API
curl -X POST http://localhost:3001/api/demo/add-order \
  -H "Content-Type: application/json" \
  -d '{"id":"TEST123","customer_name":"Test Customer","customer_phone":"555-1234","customer_email":"test@example.com","amount_total":2500,"status":"paid","items":["Test Item"]}'
```

## Configuration
**Environment Variables**:
- **Email Configuration**: GMAIL_USER, GMAIL_APP_PASSWORD
- **Twilio Configuration**: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
- **Restaurant Configuration**: RESTAURANT_PHONE, RESTAURANT_EMAIL
- **Stripe Configuration**: STRIPE_WEBHOOK_SECRET

## Key Files
- **dev-server.js**: Main server with notification system
- **twilio-service.js**: SMS notification handling
- **test-notifications.js**: Automated testing
- **api/webhook.js**: Stripe webhook handler
- **serverless/send-sms.js**: Serverless function for SMS
- **NOTIFICATION_SETUP.md**: Detailed setup instructions
- **SYSTEM_OVERVIEW.md**: System architecture overview