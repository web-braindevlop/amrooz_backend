-- Fix product_tags junction table column names
-- TypeORM uses pluralized names: productsId and tagsId

-- Drop the existing table
DROP TABLE IF EXISTS `product_tags`;

-- Recreate with correct column names
CREATE TABLE `product_tags` (
  `productsId` int NOT NULL,
  `tagsId` int NOT NULL,
  PRIMARY KEY (`productsId`,`tagsId`),
  KEY `IDX_products` (`productsId`),
  KEY `IDX_tags` (`tagsId`),
  CONSTRAINT `FK_product_tags_products` FOREIGN KEY (`productsId`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_product_tags_tags` FOREIGN KEY (`tagsId`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
