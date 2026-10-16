# 🔧 Quick Fix for Database Schema Mismatch

## Problem
Your code has more columns than the database tables you created. This causes errors like:
- `Unknown column 'refreshTokenHash'`
- `Unknown column 'Product.isNew'`
- And many more...

## Solution
Run the fix SQL script to add ALL missing columns to your existing tables.

---

## ⚡ Quick Steps (2 Minutes)

### 1. Open phpMyAdmin
- Go to: https://phpmyadmin.hostinger.com/
- Select database: **u278943707_am_rooz_cl**

### 2. Run the Fix Script
- Click the **SQL** tab
- Open file: `e:\amrooz_collection\backend\fix-all-missing-columns.sql`
- **Copy ALL content** (Ctrl+A, Ctrl+C)
- **Paste** into phpMyAdmin SQL box
- Click **Go**

### 3. Restart Backend
```bash
ssh u278943707@145.79.30.125 -p 65002
pm2 restart all
```

### 4. Test
Visit: https://api.amroozcollection.com/

Should work now! ✅

---

## What This Script Does

Adds missing columns to:
- ✅ `admins` table: `refreshTokenHash`
- ✅ `products` table: `isNew`, `rating`, `reviewCount`, `type`, `externalUrl`, `buttonText`, `groupedProductIds`
- ✅ `categories` table: `imageUrl`, `isActive`, `sortOrder`
- ✅ `brands` table: `logoUrl`, `isActive`, `sortOrder`
- ✅ `product_images` table: `color`, `isPrimary`, `sortOrder`
- ✅ `product_variants` table: `colorHex`, `salePrice`, `saleStartDate`, `saleEndDate`, `isActive`, `imageUrl`

Also removes old columns that don't exist in the code anymore.

---

## Alternative: Full Recreate (If Fix Doesn't Work)

If the ALTER TABLE commands fail, you can drop and recreate all tables:

⚠️ **WARNING**: This will DELETE ALL DATA!

1. In phpMyAdmin, go to database **u278943707_am_rooz_cl**
2. Click **Structure** tab
3. Select all tables (check the boxes)
4. Click **Drop** at the bottom
5. Confirm deletion
6. Go back to **SQL** tab
7. Copy **entire content** of `database-schema.sql` (the updated one)
8. Paste and click **Go**
9. Restart backend: `pm2 restart all`

---

## Files You Need

1. **`fix-all-missing-columns.sql`** ← Use this first (safest)
2. **`database-schema.sql`** ← Use if you need to recreate from scratch

Both are in: `e:\amrooz_collection\backend\`

---

## ✅ Expected Result

After running the fix:
- ✅ Backend API starts without errors
- ✅ Products endpoint works
- ✅ Admin login works
- ✅ Frontend loads data from backend

---

## Still Having Issues?

Check the backend logs:
```bash
ssh u278943707@145.79.30.125 -p 65002
pm2 logs
```

Look for any more "Unknown column" errors and let me know!
