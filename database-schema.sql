-- Amrooz Collection Database Schema
-- Run this SQL script in phpMyAdmin to create all tables

-- Drop existing tables if they exist (BE CAREFUL!)
-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS `order_items`;
-- DROP TABLE IF EXISTS `orders`;
-- DROP TABLE IF EXISTS `reviews`;
-- DROP TABLE IF EXISTS `product_images`;
-- DROP TABLE IF EXISTS `product_variants`;
-- DROP TABLE IF EXISTS `products`;
-- DROP TABLE IF EXISTS `attribute_terms`;
-- DROP TABLE IF EXISTS `attributes`;
-- DROP TABLE IF EXISTS `tags`;
-- DROP TABLE IF EXISTS `brands`;
-- DROP TABLE IF EXISTS `categories`;
-- DROP TABLE IF EXISTS `admins`;
-- DROP TABLE IF EXISTS `customers`;
-- DROP TABLE IF EXISTS `addresses`;
-- SET FOREIGN_KEY_CHECKS = 1;

-- Admins table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(180) NOT NULL,
  `name` varchar(120) DEFAULT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `failedLoginAttempts` int NOT NULL DEFAULT '0',
  `lockedUntil` datetime DEFAULT NULL,
  `lastLoginAt` datetime DEFAULT NULL,
  `refreshTokenHash` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_051db7d37d478a69a7432df144` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `slug` varchar(140) NOT NULL,
  `description` text DEFAULT NULL,
  `imageUrl` varchar(500) DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `sortOrder` int NOT NULL DEFAULT '0',
  `parentId` int DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_420d9f679d41281f282f5bc7d0` (`slug`),
  KEY `FK_9a6f051e66982b5f0318981bcaa` (`parentId`),
  CONSTRAINT `FK_9a6f051e66982b5f0318981bcaa` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags table
CREATE TABLE IF NOT EXISTS `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `slug` varchar(140) NOT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_d90243459a697eadb8ad56e909` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Brands table
CREATE TABLE IF NOT EXISTS `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `slug` varchar(140) NOT NULL,
  `description` text DEFAULT NULL,
  `logoUrl` varchar(500) DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `sortOrder` int NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_96db6bbbaa6f23cad26871339b` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attributes table
CREATE TABLE IF NOT EXISTS `attributes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `slug` varchar(70) NOT NULL,
  `type` enum('select','swatch','radio') NOT NULL DEFAULT 'select',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_913b92f55b7e0ecf3fa7d3fcff` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attribute terms table
CREATE TABLE IF NOT EXISTS `attribute_terms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `value` varchar(60) NOT NULL,
  `slug` varchar(70) NOT NULL,
  `displayOrder` int NOT NULL DEFAULT '0',
  `attributeId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_d485084bea7eaa5b891e9918362` (`attributeId`),
  CONSTRAINT `FK_d485084bea7eaa5b891e9918362` FOREIGN KEY (`attributeId`) REFERENCES `attributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `shortDescription` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `compareAtPrice` decimal(10,2) DEFAULT NULL,
  `sku` varchar(80) DEFAULT NULL,
  `brandId` int DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `isFeatured` tinyint NOT NULL DEFAULT '0',
  `isNew` tinyint NOT NULL DEFAULT '0',
  `rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `reviewCount` int NOT NULL DEFAULT '0',
  `type` varchar(20) DEFAULT NULL,
  `externalUrl` varchar(500) DEFAULT NULL,
  `buttonText` varchar(80) DEFAULT NULL,
  `groupedProductIds` json DEFAULT NULL,
  `categoryId` int DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_c44ac33a05b144dd0d9ddcf932` (`slug`),
  UNIQUE KEY `IDX_c30f2f6c0e20e2e12b0246088bf` (`sku`),
  KEY `IDX_brandId` (`brandId`),
  KEY `IDX_categoryId` (`categoryId`),
  CONSTRAINT `FK_products_brand` FOREIGN KEY (`brandId`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_products_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product tags (junction table)
-- TypeORM uses pluralized column names for many-to-many relationships
CREATE TABLE IF NOT EXISTS `product_tags` (
  `productsId` int NOT NULL,
  `tagsId` int NOT NULL,
  PRIMARY KEY (`productsId`,`tagsId`),
  KEY `IDX_products` (`productsId`),
  KEY `IDX_tags` (`tagsId`),
  CONSTRAINT `FK_product_tags_products` FOREIGN KEY (`productsId`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_product_tags_tags` FOREIGN KEY (`tagsId`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product images table
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(500) NOT NULL,
  `altText` varchar(200) DEFAULT NULL,
  `color` varchar(60) DEFAULT NULL,
  `isPrimary` tinyint NOT NULL DEFAULT '0',
  `sortOrder` int NOT NULL DEFAULT '0',
  `productId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_color` (`color`),
  KEY `IDX_productId` (`productId`),
  CONSTRAINT `FK_product_images_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product variants table
CREATE TABLE IF NOT EXISTS `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `size` varchar(40) DEFAULT NULL,
  `color` varchar(60) DEFAULT NULL,
  `colorHex` varchar(9) DEFAULT NULL,
  `sku` varchar(90) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `priceOverride` decimal(10,2) DEFAULT NULL,
  `salePrice` decimal(10,2) DEFAULT NULL,
  `saleStartDate` varchar(32) DEFAULT NULL,
  `saleEndDate` varchar(32) DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `imageUrl` varchar(500) DEFAULT NULL,
  `productId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_productId` (`productId`),
  CONSTRAINT `FK_product_variants_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rating` int NOT NULL,
  `title` varchar(150) DEFAULT NULL,
  `comment` text,
  `authorName` varchar(100) DEFAULT NULL,
  `authorEmail` varchar(180) DEFAULT NULL,
  `isVerifiedPurchase` tinyint NOT NULL DEFAULT '0',
  `isApproved` tinyint NOT NULL DEFAULT '0',
  `productId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_a6b3c434392f5d10ec171043666` (`productId`),
  CONSTRAINT `FK_a6b3c434392f5d10ec171043666` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customers table
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(180) NOT NULL,
  `firstName` varchar(80) NOT NULL,
  `lastName` varchar(80) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_8536b8b85c06969f84f0c09513` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Addresses table
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(160) NOT NULL,
  `street` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postalCode` varchar(20) DEFAULT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'Pakistan',
  `phone` varchar(30) DEFAULT NULL,
  `isDefault` tinyint NOT NULL DEFAULT '0',
  `customerId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_16aac8a9f6f9c1dd6b3f72c3828` (`customerId`),
  CONSTRAINT `FK_16aac8a9f6f9c1dd6b3f72c3828` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderNumber` varchar(30) NOT NULL,
  `email` varchar(180) NOT NULL,
  `status` enum('pending','paid','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `shippingCost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(3) NOT NULL DEFAULT 'PKR',
  `shippingAddress` json DEFAULT NULL,
  `notes` text,
  `customerId` int DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1f4b3c8b2e1a8e4d5f6c7d8e9f` (`orderNumber`),
  KEY `IDX_772d0ce0473ac2ccfa26060dbe` (`customerId`),
  KEY `IDX_a922b820eeef29ac1c6800e826` (`email`),
  CONSTRAINT `FK_772d0ce0473ac2ccfa26060dbe` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productName` varchar(200) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `variantLabel` varchar(120) DEFAULT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `orderId` int NOT NULL,
  `productId` int DEFAULT NULL,
  `variantId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_145532db85752b29c57d2b7b1f1` (`orderId`),
  KEY `FK_f1d359a55923bb45b057fbdab0d` (`productId`),
  KEY `FK_b8b2d2d6e2f5c6d7e8f9a0b1c2d` (`variantId`),
  CONSTRAINT `FK_145532db85752b29c57d2b7b1f1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_b8b2d2d6e2f5c6d7e8f9a0b1c2d` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_f1d359a55923bb45b057fbdab0d` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Password: Admin@123 (hashed with bcrypt)
-- Hash generated for password: Admin@123
INSERT INTO `admins` (`email`, `name`, `passwordHash`, `isActive`) VALUES
('admin@amroozcollection.com', 'Admin', '$2b$10$XN5fJTJGzE8p0qZ1hH5kD.YGHZqGqO8JZYiH6K5cQOqD8HF1MN9Xa', 1)
ON DUPLICATE KEY UPDATE `email` = `email`;
