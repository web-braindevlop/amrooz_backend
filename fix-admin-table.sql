-- Fix for existing admins table
-- Add the missing refreshTokenHash column

-- Add refreshTokenHash column to admins table
ALTER TABLE `admins` 
ADD COLUMN `refreshTokenHash` varchar(255) DEFAULT NULL AFTER `lastLoginAt`;

-- Verify the column was added
DESCRIBE `admins`;
