import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { numeric } from '../common/numeric.transformer';

/**
 * A line item on an order. Product name/SKU/price are snapshotted so the
 * order history stays accurate even if the catalogue changes later.
 */
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  // Soft references — kept even if the product/variant is later deleted
  @Column({ nullable: true })
  productId: number;

  @Column({ nullable: true })
  variantId: number;

  @Column({ length: 180 })
  productName: string;

  @Column({ length: 90, nullable: true })
  sku: string;

  @Column({ length: 120, nullable: true })
  variantLabel: string;

  @Column('decimal', { precision: 10, scale: 2, transformer: numeric })
  unitPrice: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, transformer: numeric })
  subtotal: number;

  @Index()
  @Column()
  orderId: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
