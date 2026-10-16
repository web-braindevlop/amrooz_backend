-- ===============================================
-- COMPLETE DATABASE FIX - ALL MISSING COLUMNS
-- Run this ONE file to fix everything at once
-- ===============================================

-- 1. Fix admins table
ALTER TABLE `admins` 
ADD COLUMN IF NOT EXISTS `refreshTokenHash` varchar(255) DEFAULT NULL AFTER `lastLoginAt`;

-- 2. Fix products table
ALTER TABLE `products` 
ADD COLUMN IF NOT EXISTS `isNew` tinyint NOT NULL DEFAULT '0' AFTER `isFeatured`,
ADD COLUMN IF NOT EXISTS `rating` decimal(3,2) NOT NULL DEFAULT '0.00' AFTER `isNew`,
ADD COLUMN IF NOT EXISTS `reviewCount` int NOT NULL DEFAULT '0' AFTER `rating`,
ADD COLUMN IF NOT EXISTS `type` varchar(20) DEFAULT NULL AFTER `reviewCount`,
ADD COLUMN IF NOT EXISTS `externalUrl` varchar(500) DEFAULT NULL AFTER `type`,
ADD COLUMN IF NOT EXISTS `buttonText` varchar(80) DEFAULT NULL AFTER `externalUrl`,
ADD COLUMN IF NOT EXISTS `groupedProductIds` json DEFAULT NULL AFTER `buttonText`;

-- 3. Fix categories table
ALTER TABLE `categories`
ADD COLUMN IF NOT EXISTS `imageUrl` varchar(500) DEFAULT NULL AFTER `description`,
ADD COLUMN IF NOT EXISTS `isActive` tinyint NOT NULL DEFAULT '1' AFTER `imageUrl`,
ADD COLUMN IF NOT EXISTS `sortOrder` int NOT NULL DEFAULT '0' AFTER `isActive`;

-- 4. Fix brands table
ALTER TABLE `brands`
ADD COLUMN IF NOT EXISTS `logoUrl` varchar(500) DEFAULT NULL AFTER `description`,
ADD COLUMN IF NOT EXISTS `isActive` tinyint NOT NULL DEFAULT '1' AFTER `logoUrl`,
ADD COLUMN IF NOT EXISTS `sortOrder` int NOT NULL DEFAULT '0' AFTER `isActive`;

-- 5. Fix tags table
ALTER TABLE `tags`
ADD COLUMN IF NOT EXISTS `description` text DEFAULT NULL AFTER `slug`;

-- 6. Fix attributes table
ALTER TABLE `attributes`
ADD COLUMN IF NOT EXISTS `description` text DEFAULT NULL AFTER `slug`,
ADD COLUMN IF NOT EXISTS `sortOrder` int NOT NULL DEFAULT '0' AFTER `description`;

-- Remove old 'type' column if it exists (changed to enum in old schema but not in entity)
ALTER TABLE `attributes`
DROP COLUMN IF EXISTS `type`;

-- 7. Fix attribute_terms table  
ALTER TABLE `attribute_terms`
ADD COLUMN IF NOT EXISTS `name` varchar(120) NOT NULL AFTER `id`,
ADD COLUMN IF NOT EXISTS `description` text DEFAULT NULL AFTER `slug`,
ADD COLUMN IF NOT EXISTS `sortOrder` int NOT NULL DEFAULT '0' AFTER `description`;

-- Remove old 'value' and 'displayOrder' columns
ALTER TABLE `attribute_terms`
DROP COLUMN IF EXISTS `value`,
DROP COLUMN IF EXISTS `displayOrder`;

-- 8. Fix product_images table
ALTER TABLE `product_images`
ADD COLUMN IF NOT EXISTS `color` varchar(60) DEFAULT NULL AFTER `altText`,
ADD COLUMN IF NOT EXISTS `isPrimary` tinyint NOT NULL DEFAULT '0' AFTER `color`,
ADD COLUMN IF NOT EXISTS `sortOrder` int NOT NULL DEFAULT '0' AFTER `isPrimary`;

-- 9. Fix product_variants table
ALTER TABLE `product_variants`
ADD COLUMN IF NOT EXISTS `colorHex` varchar(9) DEFAULT NULL AFTER `color`,
ADD COLUMN IF NOT EXISTS `salePrice` decimal(10,2) DEFAULT NULL AFTER `priceOverride`,
ADD COLUMN IF NOT EXISTS `saleStartDate` varchar(32) DEFAULT NULL AFTER `salePrice`,
ADD COLUMN IF NOT EXISTS `saleEndDate` varchar(32) DEFAULT NULL AFTER `saleStartDate`,
ADD COLUMN IF NOT EXISTS `isActive` tinyint NOT NULL DEFAULT '1' AFTER `saleEndDate`,
ADD COLUMN IF NOT EXISTS `imageUrl` varchar(500) DEFAULT NULL AFTER `isActive`;

-- 10. Fix product_tags junction table (column name issue)
DROP TABLE IF EXISTS `product_tags`;

CREATE TABLE `product_tags` (
  `productsId` int NOT NULL,
  `tagsId` int NOT NULL,
  PRIMARY KEY (`productsId`,`tagsId`),
  KEY `IDX_products` (`productsId`),
  KEY `IDX_tags` (`tagsId`),
  CONSTRAINT `FK_product_tags_products` FOREIGN KEY (`productsId`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_product_tags_tags` FOREIGN KEY (`tagsId`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verification queries
SELECT 'Verifying table structures...' AS status;

-- Show key table structures
DESCRIBE `admins`;
DESCRIBE `products`;
DESCRIBE `categories`;
DESCRIBE `brands`;
DESCRIBE `tags`;
DESCRIBE `attributes`;
DESCRIBE `attribute_terms`;
DESCRIBE `product_images`;
DESCRIBE `product_variants`;
DESCRIBE `product_tags`;

SELECT 'Database fix complete! Restart your backend now.' AS status;
