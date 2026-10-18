-- Complete Customer Authentication Migration
-- Run this in phpMyAdmin on your Hostinger database
-- This adds all missing columns needed for customer authentication and password reset

USE u278943707_am_rooz_cl;

-- Check current table structure first
DESCRIBE `customers`;

-- ==============================================
-- SECURITY COLUMNS (for account lockout)
-- ==============================================

-- Add failedLoginAttempts (tracks failed login attempts)
ALTER TABLE `customers`
ADD COLUMN `failedLoginAttempts` INT NOT NULL DEFAULT 0 AFTER `acceptsMarketing`;

-- Add lockedUntil (timestamp when account lockout expires)
ALTER TABLE `customers`
ADD COLUMN `lockedUntil` DATETIME DEFAULT NULL AFTER `failedLoginAttempts`;

-- Add lastLoginAt (tracks last successful login)
ALTER TABLE `customers`
ADD COLUMN `lastLoginAt` DATETIME DEFAULT NULL AFTER `lockedUntil`;

-- ==============================================
-- PASSWORD RESET COLUMNS
-- ==============================================

-- Add resetPasswordToken (stores secure reset token)
ALTER TABLE `customers`
ADD COLUMN `resetPasswordToken` VARCHAR(255) DEFAULT NULL AFTER `lastLoginAt`;

-- Add resetPasswordExpires (timestamp when reset token expires)
ALTER TABLE `customers`
ADD COLUMN `resetPasswordExpires` DATETIME DEFAULT NULL AFTER `resetPasswordToken`;

-- ==============================================
-- VERIFY ALL COLUMNS ADDED SUCCESSFULLY
-- ==============================================

DESCRIBE `customers`;

-- Expected output should show these columns:
-- id                      int(11)         NO  PRI  NULL                auto_increment
-- email                   varchar(180)    NO  UNI  NULL
-- passwordHash            varchar(255)    YES      NULL
-- firstName               varchar(80)     NO       NULL
-- lastName                varchar(80)     NO       NULL
-- phone                   varchar(30)     YES      NULL
-- isActive                tinyint(1)      NO       1
-- acceptsMarketing        tinyint(1)      NO       0
-- failedLoginAttempts     int(11)         NO       0
-- lockedUntil             datetime        YES      NULL
-- lastLoginAt             datetime        YES      NULL
-- resetPasswordToken      varchar(255)    YES      NULL
-- resetPasswordExpires    datetime        YES      NULL
-- createdAt               datetime(6)     NO       current_timestamp(6)
-- updatedAt               datetime(6)     NO       current_timestamp(6)  on update current_timestamp(6)

-- ==============================================
-- NOTES
-- ==============================================
-- If any ALTER TABLE fails with error 1060 "Duplicate column name",
-- that column already exists. Skip that statement and continue with the next one.
--
-- Purpose of each column:
-- - failedLoginAttempts: Counts consecutive failed login attempts (resets on successful login)
-- - lockedUntil: Timestamp until which account is locked (set after 5 failed attempts)
-- - lastLoginAt: Tracks last successful login for security audit
-- - resetPasswordToken: Stores secure token for password reset (single-use)
-- - resetPasswordExpires: Token expiration timestamp (1 hour from generation)
