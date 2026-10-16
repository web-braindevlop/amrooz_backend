# 🚨 DATABASE MIGRATION REQUIRED

## Critical Issue
The production database is missing columns required for the new email/customer account feature.

## Error
```
Unknown column 'Customer.isActive' in 'SELECT'
Unknown column 'Customer.acceptsMarketing' in 'SELECT'
```

## Quick Fix - Run This SQL Now

### Option 1: Via phpMyAdmin (Recommended)
1. Log into Hostinger control panel
2. Open phpMyAdmin
3. Select database: `u278943707_am_rooz_cl`
4. Click "SQL" tab
5. Copy and paste this SQL:

```sql
-- Add missing columns to customers table
ALTER TABLE `customers` 
ADD COLUMN `passwordHash` VARCHAR(255) DEFAULT NULL AFTER `email`,
ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1 AFTER `phone`,
ADD COLUMN `acceptsMarketing` TINYINT(1) NOT NULL DEFAULT 0 AFTER `isActive`;

-- Verify columns were added
DESCRIBE `customers`;
```

6. Click "Go"
7. Verify you see: `passwordHash`, `isActive`, and `acceptsMarketing` in the results

### Option 2: Via SQL File
Run the provided `add-customer-columns.sql` file in phpMyAdmin

### Option 3: Via MySQL Command Line
```bash
mysql -u u278943707_am_rooz_cl -p u278943707_am_rooz_cl < add-customer-columns.sql
```

## What These Columns Do

### `passwordHash` (VARCHAR 255, NULLABLE)
- Stores bcrypt-hashed customer passwords
- Required for customer account login
- NULL for customers created before this feature

### `isActive` (TINYINT 1, DEFAULT 1)
- Controls whether customer account is enabled
- 1 = active (can login), 0 = disabled
- Defaults to active for all customers

### `acceptsMarketing` (TINYINT 1, DEFAULT 0)
- Tracks customer's marketing email preferences
- 1 = opted in, 0 = opted out
- Defaults to opted out (GDPR compliant)

## Verification

After running the migration, verify with:

```sql
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'u278943707_am_rooz_cl' 
  AND TABLE_NAME = 'customers'
ORDER BY ORDINAL_POSITION;
```

Expected columns:
- id
- email
- passwordHash (new)
- firstName
- lastName
- phone
- isActive (new)
- acceptsMarketing (new)
- createdAt
- updatedAt

## After Migration

Once the columns are added:
1. Restart your Node.js application (if not auto-restarted)
2. Try placing a test order
3. Check if the customer account is created
4. Verify the confirmation email is sent

## Schema Files Updated

The following schema files have been updated with the correct structure:
- ✅ `database-schema.sql` - Full schema with all columns
- ✅ `add-customer-columns.sql` - Migration to add missing columns only

## Important Notes

⚠️ **This migration is safe** - it only ADDS columns, doesn't delete or modify existing data

⚠️ **Existing customers** will have:
- `passwordHash` = NULL (they can use "Forgot Password" to set one)
- `isActive` = 1 (enabled by default)
- `acceptsMarketing` = 0 (opted out by default)

⚠️ **New customers** (created after migration) will have:
- `passwordHash` = bcrypt hash of generated password
- `isActive` = 1
- `acceptsMarketing` = 0

## Rollback (if needed)

If you need to remove these columns:

```sql
ALTER TABLE `customers` 
DROP COLUMN `acceptsMarketing`,
DROP COLUMN `isActive`,
DROP COLUMN `passwordHash`;
```

But this will break the email/customer account feature!

## Support

If you encounter issues:
1. Check the exact error message in backend logs
2. Verify database connection is working
3. Confirm you're running the SQL on the correct database
4. Check user has ALTER permissions on the database
