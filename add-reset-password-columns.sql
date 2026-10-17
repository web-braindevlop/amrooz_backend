-- Add reset password token columns to customers table
ALTER TABLE `customers`
  ADD COLUMN `resetPasswordToken` VARCHAR(255) DEFAULT NULL AFTER `lastLoginAt`;

ALTER TABLE `customers`
  ADD COLUMN `resetPasswordExpires` DATETIME DEFAULT NULL AFTER `resetPasswordToken`;
