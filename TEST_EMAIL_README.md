# Email Testing Guide

## Quick Test Script

I've created `test-email.js` to test your email configuration without needing to place an actual order.

## How to Run

### Option 1: Test with default email (amroozcollection@gmail.com)
```bash
cd backend
node test-email.js
```

### Option 2: Test with your own email
```bash
cd backend
node test-email.js your-email@example.com
```

### Option 3: Test with specific email
```bash
node test-email.js amroozcollection@gmail.com
```

## What the Script Does

1. ✅ Loads your `.env` configuration
2. ✅ Displays SMTP settings
3. ✅ Tests SMTP connection
4. ✅ Loads the order confirmation template
5. ✅ Sends a test email with fake order data
6. ✅ Reports success or shows detailed errors

## Expected Output

### Success:
```
============================================================
📧 EMAIL CONFIGURATION TEST
============================================================

📋 Configuration:
  Host:     mail.amroozcollection.com
  Port:     465
  Secure:   true
  User:     no-reply@amroozcollection.com
  From:     Amrooz Collection <no-reply@amroozcollection.com>
  To:       your-email@example.com

✅ Email template loaded successfully

🔌 Connecting to SMTP server...

✅ SMTP Connection Successful!

📤 Sending test email...

✅ Email Sent Successfully!

📧 Email Details:
  Message ID: <xxx@xxx>
  Response: 250 Message accepted

✅ CHECK YOUR INBOX!
   Email sent to: your-email@example.com
   Check spam folder if not in inbox

============================================================
🎉 EMAIL TEST COMPLETED SUCCESSFULLY
============================================================
```

### Failure (Wrong Settings):
```
❌ SMTP Connection Failed!

Error Details:
  Code: EAUTH
  Message: Invalid login credentials

Common Issues:
  • Wrong host (try smtp.hostinger.com instead of mail.amroozcollection.com)
  • Wrong port (try 587 instead of 465)
  • Wrong password
  • Email account not created in Hostinger
  • Firewall blocking outbound SMTP
```

## Troubleshooting

### If Connection Fails

#### Try Alternative Host
Edit `.env` and change:
```env
# From:
MAIL_HOST=mail.amroozcollection.com

# To:
MAIL_HOST=smtp.hostinger.com
```

#### Try Alternative Port
Edit `.env` and change:
```env
# From:
MAIL_PORT=465
MAIL_SECURE=true

# To:
MAIL_PORT=587
MAIL_SECURE=false
```

Then run the test again.

### If Email Not Received

1. **Check Spam Folder**
   - Gmail, Outlook often mark transactional emails as spam initially

2. **Check Email Account Exists**
   - Log into Hostinger control panel
   - Email → Email Accounts
   - Verify `no-reply@amroozcollection.com` exists

3. **Check Password**
   - Verify password in `.env` matches Hostinger
   - Try resetting the email password

4. **Check DNS Records**
   - MX records must point to Hostinger
   - SPF record: `v=spf1 include:_spf.hostinger.com ~all`

5. **Wait a Few Minutes**
   - Sometimes there's a delay in email delivery

### Common Error Codes

- **EAUTH** - Wrong username or password
- **ECONNREFUSED** - Wrong host or port, or firewall blocking
- **ETIMEDOUT** - Connection timeout, firewall or network issue
- **ENOTFOUND** - DNS cannot resolve mail server hostname
- **ESOCKET** - SSL/TLS connection issue

## Advanced Testing

### Test SMTP with Telnet
```bash
telnet mail.amroozcollection.com 465
# or
telnet smtp.hostinger.com 465
```

If successful, you'll see:
```
220 mail.hostinger.com ESMTP
```

### Test with Different Email Providers

Test delivery to multiple providers:
```bash
node test-email.js gmail@gmail.com
node test-email.js test@outlook.com
node test-email.js your@yahoo.com
```

This helps identify if specific providers are blocking your emails.

## What's in the Test Email

The test email contains:
- **Subject:** Test Order Confirmation - #TEST[timestamp]
- **Order Number:** TEST[timestamp]
- **Items:** 2 fake products
- **Shipping Address:** Test data
- **Account Credentials:** TestPass123!
- **Full order confirmation template**

It's identical to what real customers will receive.

## After Successful Test

Once the test succeeds:

1. ✅ Your SMTP configuration is correct
2. ✅ Emails will work for real orders
3. ✅ You can place a real order to test end-to-end
4. ✅ Check production backend logs for any errors

## Files Created

- ✅ `test-email.js` - The test script
- ✅ `TEST_EMAIL_README.md` - This guide

## Next Steps

1. Run the test script
2. Check your email (inbox and spam)
3. If successful, place a real order
4. If failed, follow troubleshooting steps above
5. Report the error message for help

## Running on Production Server

You can also run this on your Hostinger server:

```bash
# SSH into your server
ssh u278943707@your-server

# Navigate to backend directory
cd domains/api.amroozcollection.com/hbuilds/current/nodejs

# Run test
node test-email.js amroozcollection@gmail.com
```

This tests the production environment directly.
