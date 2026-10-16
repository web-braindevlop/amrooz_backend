# Security Policy

## 🔐 Environment Variables & Secrets Management

This project uses environment variables for configuration. **Never commit sensitive credentials to version control.**

### Local Development

The `.env` file is gitignored but **may contain sensitive data** like database passwords and email credentials. 

**Important:**
- The `.env` file is for local development convenience only
- Use `.env.example` as a template (contains placeholders, not real credentials)
- Never commit `.env` to git — it's already in `.gitignore`
- If you accidentally committed secrets, rotate them immediately

### Production Deployment

For production environments (Hostinger or any hosting provider):

1. **Do NOT rely on `.env` file** — use the hosting provider's environment variables panel
2. **Set sensitive variables directly in hosting control panel:**
   - `MAIL_PASS` - Email account password
   - `JWT_ACCESS_SECRET` - JWT signing key
   - `JWT_REFRESH_SECRET` - JWT refresh key
   - `DB_PASSWORD` - Database password

3. **Rotate credentials periodically** (every 90 days recommended)

### Email Credentials

The order confirmation system sends transactional emails via SMTP. 

**Security Requirements:**
- Email password (`MAIL_PASS`) must never be committed to git
- Set `MAIL_PASS` via Hostinger environment variables panel for production
- For local development, add to your local `.env` (which is gitignored)
- Rotate password every 90 days or if exposed
- Use a dedicated no-reply email account with minimal permissions

**Current Setup:**
- Email: `no-reply@amroozcollection.com`
- Host: `mail.amroozcollection.com`
- Port: 465 (SSL/TLS)

### JWT Secrets

Generate strong random secrets (at least 48 bytes):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**Never:**
- Use the same secret for access and refresh tokens
- Commit secrets to version control
- Share secrets via insecure channels (email, chat)
- Reuse secrets across environments

### Database Credentials

- Database passwords should be strong (16+ characters, mixed case, numbers, symbols)
- Set via hosting provider's database panel, not `.env` in production
- Never expose database ports to the public internet
- Use connection pooling limits to prevent resource exhaustion

## 📝 Reporting a Vulnerability

If you discover a security vulnerability in this project:

1. **Do NOT open a public GitHub issue**
2. Email: web.brain.devlop@gmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## ✅ Security Checklist

- [x] `.env` is in `.gitignore`
- [x] Password hashing with bcrypt (12 rounds)
- [x] JWT with access/refresh token pattern
- [x] SQL injection protection via TypeORM parameterized queries
- [x] CORS configured for specific frontend domain
- [x] Rate limiting with @nestjs/throttler
- [x] Email password not hardcoded in source files
- [x] Environment variables for all sensitive data
- [ ] Production secrets set via hosting panel (not `.env`)
- [ ] Credential rotation schedule implemented
- [ ] HTTPS enforced in production
- [ ] Security headers configured (helmet.js recommended)

## 🔄 Credential Rotation Schedule

| Credential | Frequency | Last Rotated | Next Rotation |
|------------|-----------|--------------|---------------|
| Email Password | 90 days | - | - |
| JWT Access Secret | Yearly | - | - |
| JWT Refresh Secret | Yearly | - | - |
| Database Password | 90 days | - | - |

Update this table when rotating credentials.

## 🛡️ Best Practices

1. **Principle of Least Privilege:** Grant only necessary permissions
2. **Defense in Depth:** Multiple layers of security (auth, validation, rate limiting)
3. **Fail Securely:** Errors should not expose sensitive information
4. **Audit Logging:** Log security-relevant events (login attempts, order creation)
5. **Keep Dependencies Updated:** Run `npm audit` regularly
6. **Code Review:** Security-sensitive changes require review

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
