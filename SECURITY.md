# Security Guidelines

## Environment Variables

This application requires sensitive configuration values that should **never be committed to source control**.

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the actual values for your local environment:
   - Database credentials
   - JWT secrets (generate using `openssl rand -hex 32`)
   - Email password

The `.env` file is already in `.gitignore` and will not be committed.

### Production Deployment (Hostinger)

**DO NOT use the `.env` file for production secrets.** Instead, set environment variables through your hosting provider's control panel:

1. Log in to your Hostinger control panel
2. Navigate to your application's environment variables section
3. Add the following variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_DATABASE`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `MAIL_HOST`
   - `MAIL_PORT`
   - `MAIL_SECURE`
   - `MAIL_USER`
   - `MAIL_PASS`
   - `MAIL_FROM`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://amroozcollection.com`

4. The application will read these values at runtime via `process.env`

### Credential Rotation

- **JWT Secrets**: Rotate every 90 days or immediately if compromised
- **Database Password**: Rotate every 180 days or immediately if compromised
- **Email Password**: Rotate every 180 days or immediately if compromised

### Secret Generation

Generate cryptographically secure secrets using:

```bash
# For JWT secrets (64-character hex)
openssl rand -hex 32

# For passwords (16-character alphanumeric)
openssl rand -base64 12
```

## Reporting Security Issues

If you discover a security vulnerability, please email security@amroozcollection.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**Do not** open a public GitHub issue for security vulnerabilities.
