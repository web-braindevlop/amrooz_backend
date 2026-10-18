import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { Customer } from '../customers/customer.entity';

@Entity('reviews')
@Index('idx_reviews_customer_product', ['customerId', 'productId'], { unique: true })
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  authorName: string;

  @Column({ type: 'tinyint' })
  rating: number; // 1..5

  @Column({ length: 160, nullable: true })
  title: string;

  @Column('text', { nullable: true })
  comment: string;

  @Column({ default: true })
  isApproved: boolean;

  @Column({ default: false })
  isVerifiedPurchase: boolean;

  @Index()
  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Index()
  @Column({ nullable: true })
  customerId: number;

  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @CreateDateColumn()
  createdAt: Date;
}
