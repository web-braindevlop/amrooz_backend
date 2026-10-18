ALTER TABLE reviews ADD COLUMN customerId INT NULL AFTER isVerifiedPurchase;
ALTER TABLE reviews ADD INDEX idx_reviews_customer (customerId);
CREATE UNIQUE INDEX idx_reviews_customer_product ON reviews(customerId, productId);
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_customer 
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL;
