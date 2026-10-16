-- ===============================================
-- Fix All Missing Columns in Database
-- Run this in phpMyAdmin to add all missing columns
-- ===============================================

-- Fix admins table
ALTER TABLE `admins` 
ADD COLUMN IF NOT EXISTS `refreshTokenHash` varchar(255) DEFAULT NULL AFTER `lastLoginAt`;

-- Fix products table (add many missing columns)
ALTER TABLE `products` 
ADD COLUMN IF NOT EXISTS `isNew` tinyint NOT NULL DEFAULT '0' AFTER `isFeatured`,
ADD COLUMN IF NOT EXISTS `rating` decimal(3,2) NOT NULL DEFAULT '0.00' AFTER `isNew`,
ADD COLUMN IF NOT EXISTS `reviewCount` int NOT NULL DEFAULT '0' AFTER `rating`,
ADD COLUMN IF NOT EXISTS `type` varchar(20) DEFAULT NULL AFTER `reviewCount`,
ADD COLUMN IF NOT EXISTS `externalUrl` varchar(500) DEFAULT NULL AFTER `type`,
ADD COLUMN IF NOT EXISTS `buttonText` varchar(80) DEFAULT NULL AFTER `externalUrl`,
ADD COLUMN IF NOT EXISTS `groupedProductIds` json DEFAULT NULL AFTER `buttonText`;

-- Remove old columns that don't exist in the entity
ALTER TABLE `products`
DROP COLUMN IF EXISTS `featuredImage`,
DROP COLUMN IF EXISTS `weight`,
DROP COLUMN IF EXISTS `dimensions`,
DROP COLUMN IF EXISTS `material`,
DROP COLUMN IF EXISTS `careInstructions`,
DROP COLUMN IF EXISTS `lowStockThreshold`;

-- Fix categories table (add missing columns)
ALTER TABLE `categories`
ADD COLUMN IF NOT EXISTS `imageUrl` varchar(500) DEFAULT NULL AFTER `description`,
ADD COLUMN IF NOT EXISTS `isActive` tinyint NOT NULL DEFAULT '1' AFTER `imageUrl`,
ADD COLUMN IF NOT EXISTS `sortOrder` int NOT NULL DEFAULT '0' AFTER `isActive`;

-- Remove old column that doesn't exist in the entity
ALTER TABLE `categories`
DROP COLUMN IF EXISTS `displayOrder`;

-- Fix brands table (add missing columns)
ALTER TABLE `brands`
ADD COLUMN IF NOT EXISTS `logoUrl` varchar(500) DEFAULT NULL AFTER `description`,
ADD COLUMN IF NOT EXISTS `isActive` tinyint NOT NULL DEFAULT '1' AFTER `logoUrl`,
ADD COLUMN IF NOT EXISTS `sortOrder` int NOT NULL DEFAULT '0' AFTER `isActive`;

-- Fix product_images table (add missing columns)
ALTER TABLE `product_images`
ADD COLUMN IF NOT EXISTS `color` varchar(60) DEFAULT NULL AFTER `altText`,
ADD COLUMN IF NOT EXISTS `isPrimary` tinyint NOT NULL DEFAULT '0' AFTER `color`,
ADD COLUMN IF NOT EXISTS `sortOrder` int NOT NULL DEFAULT '0' AFTER `isPrimary`;

-- Remove old column that doesn't exist in the entity
ALTER TABLE `product_images`
DROP COLUMN IF EXISTS `displayOrder`,
DROP COLUMN IF EXISTS `createdAt`;

-- Fix product_variants table (add missing columns)
ALTER TABLE `product_variants`
ADD COLUMN IF NOT EXISTS `colorHex` varchar(9) DEFAULT NULL AFTER `color`,
ADD COLUMN IF NOT EXISTS `salePrice` decimal(10,2) DEFAULT NULL AFTER `priceOverride`,
ADD COLUMN IF NOT EXISTS `saleStartDate` varchar(32) DEFAULT NULL AFTER `salePrice`,
ADD COLUMN IF NOT EXISTS `saleEndDate` varchar(32) DEFAULT NULL AFTER `saleStartDate`,
ADD COLUMN IF NOT EXISTS `isActive` tinyint NOT NULL DEFAULT '1' AFTER `saleEndDate`,
ADD COLUMN IF NOT EXISTS `imageUrl` varchar(500) DEFAULT NULL AFTER `isActive`;

-- Remove timestamps that don't exist in the entity
ALTER TABLE `product_variants`
DROP COLUMN IF EXISTS `createdAt`,
DROP COLUMN IF EXISTS `updatedAt`;

-- Fix tags table (add missing description column)
ALTER TABLE `tags`
ADD COLUMN IF NOT EXISTS `description` text DEFAULT NULL AFTER `slug`;

-- Show all tables to verify
SHOW TABLES;

-- Show structure of key tables to verify columns
DESCRIBE `admins`;
DESCRIBE `products`;
DESCRIBE `categories`;
DESCRIBE `brands`;
DESCRIBE `tags`;
DESCRIBE `product_images`;
DESCRIBE `product_variants`;
