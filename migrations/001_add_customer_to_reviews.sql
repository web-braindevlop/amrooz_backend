-- Add customerId column to reviews table for customer-review association
-- This migration is needed for production deployment where TypeORM synchronize is disabled

ALTER TABLE reviews ADD COLUMN customerId INT NULL AFTER isVerifiedPurchase;

ALTER TABLE reviews ADD INDEX idx_reviews_customer (customerId);

-- Unique constraint to enforce one review per customer per product
CREATE UNIQUE INDEX idx_reviews_customer_product ON reviews(customerId, productId);

-- Foreign key constraint to Customer entity with SET NULL on delete
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_customer 
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL;
