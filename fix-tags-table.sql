-- Quick fix for tags table - add missing description column
ALTER TABLE `tags` ADD COLUMN `description` text DEFAULT NULL AFTER `slug`;
