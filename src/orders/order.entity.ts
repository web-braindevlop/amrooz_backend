import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus, PaymentStatus } from '../common/enums';
import { numeric } from '../common/numeric.transformer';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 30 })
  orderNumber: string;

  @Column({ length: 180 })
  email: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: numeric })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: numeric })
  shippingCost: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: numeric })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: numeric })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: numeric })
  total: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Immutable snapshot of the shipping address at purchase time
  @Column('simple-json', { nullable: true })
  shippingAddress: Record<string, any>;

  @Column('text', { nullable: true })
  notes: string;

  // Guest checkout allowed → customer is optional
  @Index()
  @Column({ nullable: true })
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
