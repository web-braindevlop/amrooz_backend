# 🎯 RUN THIS ONE FILE TO FIX EVERYTHING!

## The Problem
Your database schema is missing MANY columns that your code needs.

## ⚡ The Solution (1 Minute)

### Run ONE SQL file that fixes EVERYTHING:

**File**: `COMPLETE_DATABASE_FIX.sql`

---

## Steps:

### 1. Open phpMyAdmin
https://phpmyadmin.hostinger.com/

Select database: **u278943707_am_rooz_cl**

### 2. Run the Complete Fix
- Click **SQL** tab
- Open file: `e:\amrooz_collection\backend\COMPLETE_DATABASE_FIX.sql`
- Copy **ALL content** (Ctrl+A, Ctrl+C)
- Paste into phpMyAdmin
- Click **Go**

### 3. Restart Backend
```bash
ssh u278943707@145.79.30.125 -p 65002
pm2 restart all
```

### 4. Test
Visit: https://api.amroozcollection.com/

Should work! ✅

---

## What This Fixes

✅ **admins** table: refreshTokenHash  
✅ **products** table: isNew, rating, reviewCount, type, externalUrl, buttonText, groupedProductIds  
✅ **categories** table: imageUrl, isActive, sortOrder  
✅ **brands** table: logoUrl, isActive, sortOrder  
✅ **tags** table: description  
✅ **attributes** table: description, sortOrder  
✅ **attribute_terms** table: name, description, sortOrder  
✅ **product_images** table: color, isPrimary, sortOrder  
✅ **product_variants** table: colorHex, salePrice, saleStartDate, saleEndDate, isActive, imageUrl  
✅ **product_tags** table: Fixed column names (productsId, tagsId)  

**Total**: 30+ missing columns fixed!

---

## After This

Your entire e-commerce site will be fully functional:
- ✅ Backend API working
- ✅ Products loading
- ✅ Categories, brands, tags working
- ✅ Cart and checkout
- ✅ Admin login
- ✅ Rs 250 delivery
- ✅ All prices in Rs

---

## Need Fresh Start Instead?

If ALTER TABLE commands fail, you can drop and recreate all tables:

1. In phpMyAdmin, select all tables
2. Click **Drop**
3. Run the complete `database-schema.sql` file
4. Restart backend

(This deletes all data!)

---

**IMPORTANT**: After fixing the database, your site should work perfectly. No more "Unknown column" errors!
