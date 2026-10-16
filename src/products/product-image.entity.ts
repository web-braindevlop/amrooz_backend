import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ length: 200, nullable: true })
  altText: string;

  // When set, this image belongs to a specific variant color's gallery
  // (matches ProductVariant.color) rather than the product's default/shared
  // gallery. Lets a variable product swap its gallery per selected color
  // while sizes within that color reuse the same images.
  @Index()
  @Column({ length: 60, nullable: true })
  color: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Index()
  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
