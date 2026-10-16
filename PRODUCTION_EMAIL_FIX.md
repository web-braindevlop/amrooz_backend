# 🚨 URGENT: Production Email Template Fix

## Problem on Production
```
ENOENT: no such file or directory, open '/home/.../dist/mail/templates/order-confirmation.hbs'
```

Order placed (#6FDD1293EC91) but email failed because template file is missing from dist folder.

---

## ✅ Fix Applied (Locally)

Updated `nest-cli.json` to copy `.hbs` template files during build:

```json
{
  "compilerOptions": {
    "assets": [
      {
        "include": "mail/templates/**/*.hbs",
        "outDir": "dist"
      }
    ]
  }
}
```

**Status:** 
- ✅ Committed locally
- ⏳ Push to GitHub pending (network issue)
- ❌ Not yet deployed to production

---

## 🔧 Manual Production Fix (IMMEDIATE)

### Option 1: Upload Template Manually (Quick Fix)

1. **SSH into Hostinger:**
   ```bash
   ssh u278943707@your-server
   ```

2. **Create template directory:**
   ```bash
   cd /home/u278943707/domains/api.amroozcollection.com/hbuilds/current/nodejs
   mkdir -p dist/mail/templates
   ```

3. **Upload the template file:**
   - Use SFTP or File Manager
   - Upload: `backend/src/mail/templates/order-confirmation.hbs`
   - To: `/home/u278943707/domains/api.amroozcollection.com/hbuilds/current/nodejs/dist/mail/templates/`

4. **Verify:**
   ```bash
   ls -la dist/mail/templates/order-confirmation.hbs
   ```

5. **Test:**
   ```bash
   node test-email.js amroozcollection@gmail.com
   ```

---

### Option 2: Rebuild on Production (Proper Fix)

After GitHub push completes and GitHub Actions deploys:

1. **The deployment will:**
   - Pull latest code with `nest-cli.json` fix
   - Run `npm run build`
   - Copy template files to `dist/mail/templates/`
   - Email feature will work automatically

---

## 📝 What This Fix Does

**Before:**
- `npm run build` compiled only TypeScript files
- Template files (.hbs) ignored
- Production dist folder missing templates
- Email sending failed with ENOENT error

**After:**
- `npm run build` compiles TypeScript AND copies .hbs files
- Templates included in dist/mail/templates/
- Email sending works in production

---

## 🧪 How to Test

### Test Email Sending:
```bash
# On production server
cd /home/u278943707/domains/api.amroozcollection.com/hbuilds/current/nodejs
node test-email.js your-email@example.com
```

### Expected Output:
```
✅ SMTP Connection Successful!
✅ Email template loaded successfully
✅ Email Sent Successfully!
```

### Place Real Order:
1. Visit https://amroozcollection.com
2. Add items to cart
3. Checkout with email address
4. Check email inbox (and spam folder)

---

## 📋 Complete Production Checklist

- [ ] Template fix pushed to GitHub
- [ ] GitHub Actions deployment completed
- [ ] Template file exists at `dist/mail/templates/order-confirmation.hbs`
- [ ] `.env` has `MAIL_HOST=smtp.hostinger.com`
- [ ] Database has customer columns (passwordHash, isActive, acceptsMarketing)
- [ ] Test email sends successfully
- [ ] Real order creates customer account
- [ ] Confirmation email received

---

## 🔍 Verify Production Build

After deployment, check if template exists:

```bash
ssh u278943707@your-server
cd /home/u278943707/domains/api.amroozcollection.com/hbuilds/current/nodejs
ls -la dist/mail/templates/
```

Should show:
```
order-confirmation.hbs
```

---

## ⚠️ Important Notes

1. **Email will fail** until template file is in dist folder
2. **Orders still save** (email failure doesn't block order creation)
3. **Customer accounts still created** (email is separate step)
4. Only **email delivery fails** - everything else works

---

## 🆘 Emergency Contact

If emails still not working after fix:

1. Check PM2 logs: `pm2 logs`
2. Run test script: `node test-email.js`
3. Verify template exists: `ls dist/mail/templates/`
4. Check .env: `cat .env | grep MAIL_`
5. Review error details in logs

---

## 📞 Next Steps

1. ✅ Wait for git push to succeed
2. ✅ GitHub Actions will auto-deploy
3. ✅ OR manually upload template file now
4. ✅ Test email sending
5. ✅ Confirm with real order

**Estimated Time to Fix:** 2-5 minutes (manual) or wait for auto-deployment
