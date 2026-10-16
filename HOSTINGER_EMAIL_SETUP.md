# Hostinger Email Configuration Guide

## SMTP Settings for Hostinger

Hostinger supports two methods for SMTP configuration:

### Option 1: Domain-Specific Mail Server (Recommended for your domain)
```env
MAIL_HOST=mail.amroozcollection.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=no-reply@amroozcollection.com
MAIL_PASS=7@6CbKaRf7jMvgG
MAIL_FROM=Amrooz Collection <no-reply@amroozcollection.com>
```

**Pros:**
- Uses your domain's mail server directly
- Better email deliverability
- Domain reputation tied to your domain

**When to use:** When your DNS is fully configured and email accounts are set up in Hostinger control panel

---

### Option 2: Hostinger's Shared SMTP Server
```env
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=no-reply@amroozcollection.com
MAIL_PASS=7@6CbKaRf7jMvgG
MAIL_FROM=Amrooz Collection <no-reply@amroozcollection.com>
```

**Pros:**
- Works immediately without DNS propagation
- Reliable Hostinger infrastructure

**When to use:** As a fallback if domain mail server has issues

---

## Alternative Ports

If port 465 doesn't work, try:

### Port 587 (TLS/STARTTLS)
```env
MAIL_HOST=mail.amroozcollection.com
MAIL_PORT=587
MAIL_SECURE=false  # STARTTLS will upgrade the connection
```

### Port 25 (Not recommended)
Not recommended as many servers block it to prevent spam.

---

## Verification Steps

1. **Check Email Account Exists**
   - Log into Hostinger control panel
   - Go to Email → Email Accounts
   - Verify `no-reply@amroozcollection.com` exists
   - Confirm password matches

2. **Test SMTP Connection**
   ```bash
   # Install telnet if needed
   telnet mail.amroozcollection.com 465
   # Or
   telnet smtp.hostinger.com 465
   ```

3. **Check DNS Records** (for Option 1)
   - MX records should point to Hostinger mail servers
   - SPF record should include Hostinger IPs
   - DKIM configured in Hostinger panel

4. **Test Sending Email**
   - Place a test order on your site
   - Check spam folder if not in inbox
   - Review backend logs for SMTP errors

---

## Common Issues & Solutions

### Issue: Connection Timeout
**Solution:** 
- Check firewall allows outbound port 465/587
- Try alternative port (587 instead of 465)
- Verify Hostinger mail server hostname

### Issue: Authentication Failed
**Solution:**
- Double-check email password in Hostinger panel
- Ensure email account is active (not suspended)
- Try resetting the email password

### Issue: Emails Going to Spam
**Solution:**
- Configure SPF record: `v=spf1 include:_spf.hostinger.com ~all`
- Enable DKIM in Hostinger email settings
- Add DMARC record: `v=DMARC1; p=quarantine; rua=mailto:postmaster@amroozcollection.com`
- Warm up your email by sending gradually increasing volumes

### Issue: "MAIL_PASS not set" Error
**Solution:**
- Ensure `.env` file is in the correct directory (`backend/.env`)
- Check no extra spaces in password
- Verify the application reads from `.env` (ConfigModule loaded)

---

## Current Configuration Status

Your `.env` file currently uses:
- **Host:** `mail.amroozcollection.com` (Domain-specific - Option 1)
- **Port:** `465` (SSL)
- **Security:** SSL enabled

This is the **recommended setup** for Hostinger with your domain.

---

## Email Deliverability Best Practices

1. **SPF Record:** Add this TXT record to DNS:
   ```
   v=spf1 include:_spf.hostinger.com ~all
   ```

2. **DKIM:** Enable in Hostinger control panel under Email → DKIM Settings

3. **DMARC:** Add this TXT record (_dmarc.amroozcollection.com):
   ```
   v=DMARC1; p=none; rua=mailto:postmaster@amroozcollection.com
   ```

4. **Reverse DNS:** Hostinger typically handles this automatically

5. **Sender Reputation:**
   - Start with low email volume
   - Avoid spam trigger words
   - Include unsubscribe links
   - Monitor bounce rates

---

## Testing Email in Development

For local development without affecting production:

1. **Use MailHog/Mailtrap** (recommended)
   ```env
   MAIL_HOST=localhost
   MAIL_PORT=1025
   MAIL_SECURE=false
   MAIL_USER=
   MAIL_PASS=
   ```

2. **Use your personal email for testing**
   ```env
   MAIL_HOST=smtp.gmail.com  # If using Gmail
   MAIL_PORT=587
   ```

---

## Production Checklist

- [ ] Email account `no-reply@amroozcollection.com` created in Hostinger
- [ ] Password verified and matches `.env`
- [ ] DNS MX records configured
- [ ] SPF record added
- [ ] DKIM enabled
- [ ] Test email sent successfully
- [ ] Check spam score using mail-tester.com
- [ ] Monitor email logs for errors

---

## Support

If issues persist:
1. Contact Hostinger support with SMTP connection errors
2. Check Hostinger status page for mail server outages
3. Review backend logs: `npm run start:dev` and check console output
