-- Add missing columns to customers table for email feature
-- Run this on your production database (phpMyAdmin or MySQL command line)

USE u278943707_am_rooz_cl;

-- Add isActive column (default true)
ALTER TABLE `customers` 
ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1 AFTER `phone`;

-- Add acceptsMarketing column (default false)
ALTER TABLE `customers` 
ADD COLUMN `acceptsMarketing` TINYINT(1) NOT NULL DEFAULT 0 AFTER `isActive`;

-- Verify the columns were added
DESCRIBE `customers`;

-- Expected output should show:
-- id, email, passwordHash, firstName, lastName, phone, isActive, acceptsMarketing, createdAt, updatedAt
