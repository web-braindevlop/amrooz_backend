import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { ProductImage } from './products/product-image.entity';
import { ProductVariant } from './products/product-variant.entity';
import { Review } from './products/review.entity';
import { Tag } from './tags/tag.entity';
import { Brand } from './brands/brand.entity';
import { Attribute } from './attributes/attribute.entity';
import { AttributeTerm } from './attributes/attribute-term.entity';
import { Customer } from './customers/customer.entity';
import { Address } from './customers/address.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { Admin } from './admin/admin.entity';

dotenv.config();

/**
 * Standalone TypeORM DataSource (used by the seed script and available for
 * future migrations). Mirrors the connection config in app.module.ts.
 */
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'am_rooz_cl',
  charset: 'utf8mb4',
  // Force IPv4 to avoid IPv6 connection issues
  extra: {
    connectionLimit: 10,
    socketPath: undefined, // Disable Unix socket to use TCP
    // Force IPv4 by setting DNS lookup to return IPv4 only
    // This prevents '::1' IPv6 connections
  },
  connectTimeout: 10000,
  synchronize: true,
  logging: false,
  entities: [
    Category,
    Product,
    ProductImage,
    ProductVariant,
    Review,
    Tag,
    Brand,
    Attribute,
    AttributeTerm,
    Customer,
    Address,
    Order,
    OrderItem,
    Admin,
  ],
});
