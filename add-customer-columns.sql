-- Add missing columns to customers table for authentication and email features
-- Run this on your production database (phpMyAdmin or MySQL command line)
-- Safe to run multiple times - checks for existing columns

USE u278943707_am_rooz_cl;

-- Check existing columns first
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'u278943707_am_rooz_cl' 
  AND TABLE_NAME = 'customers';

-- Add columns only if they don't exist (run each one separately)

-- passwordHash (skip if error 1060 - already exists)
ALTER TABLE `customers` 
ADD COLUMN `passwordHash` VARCHAR(255) DEFAULT NULL AFTER `email`;

-- isActive (skip if error 1060 - already exists)
ALTER TABLE `customers` 
ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1 AFTER `passwordHash`;

-- acceptsMarketing (skip if error 1060 - already exists)
ALTER TABLE `customers` 
ADD COLUMN `acceptsMarketing` TINYINT(1) NOT NULL DEFAULT 0 AFTER `isActive`;

-- failedLoginAttempts (skip if error 1060 - already exists)
ALTER TABLE `customers`
ADD COLUMN `failedLoginAttempts` INT NOT NULL DEFAULT 0 AFTER `acceptsMarketing`;

-- lockedUntil (skip if error 1060 - already exists)
ALTER TABLE `customers`
ADD COLUMN `lockedUntil` DATETIME DEFAULT NULL AFTER `failedLoginAttempts`;

-- lastLoginAt (skip if error 1060 - already exists)
ALTER TABLE `customers`
ADD COLUMN `lastLoginAt` DATETIME DEFAULT NULL AFTER `lockedUntil`;

-- Verify the final table structure
DESCRIBE `customers`;

-- Expected columns:
-- id, email, passwordHash, firstName, lastName, phone, 
-- isActive, acceptsMarketing, failedLoginAttempts, lockedUntil, lastLoginAt,
-- createdAt, updatedAt
