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

@Entity('reviews')
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

  @CreateDateColumn()
  createdAt: Date;
}
