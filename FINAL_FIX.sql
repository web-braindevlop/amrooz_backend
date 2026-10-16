-- ===============================================
-- FINAL FIX - Run this to fix the product_tags table
-- ===============================================

-- The product_tags junction table has wrong column names
-- TypeORM expects: productsId and tagsId (pluralized)
-- Current table has: productId and tagId

-- Drop and recreate the junction table with correct column names
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

-- Verify the table structure
DESCRIBE `product_tags`;

-- You should see:
-- productsId | int | NO  | PRI
-- tagsId     | int | NO  | PRI
