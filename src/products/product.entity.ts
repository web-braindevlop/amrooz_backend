import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { Brand } from '../brands/brand.entity';
import { Tag } from '../tags/tag.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { Review } from './review.entity';
import { numeric } from '../common/numeric.transformer';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 180 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 200 })
  slug: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  shortDescription: string;

  @Column('decimal', { precision: 10, scale: 2, transformer: numeric })
  price: number;

  // Original / "compare at" price — enables a strikethrough + discount %
  @Column('decimal', { precision: 10, scale: 2, nullable: true, transformer: numeric })
  compareAtPrice: number;

  @Index({ unique: true })
  @Column({ length: 80, nullable: true })
  sku: string;

  @Index()
  @Column({ nullable: true })
  brandId: number;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isNew: boolean;

  // Denormalised rating summary (recomputed from reviews)
  @Column('decimal', { precision: 3, scale: 2, default: 0, transformer: numeric })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  // WooCommerce-style product type: simple | grouped | external | variable.
  // Nullable (no SQL default) is treated as "simple" by the service.
  @Column({ length: 20, nullable: true })
  type: string;

  // External / affiliate products link out instead of adding to cart.
  @Column({ nullable: true })
  externalUrl: string;

  @Column({ length: 80, nullable: true })
  buttonText: string;

  // Grouped products reference their child product ids.
  @Column('simple-json', { nullable: true })
  groupedProductIds: number[];

  // Relations
  @Index()
  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants: ProductVariant[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @ManyToMany(() => Tag, (tag) => tag.products)
  @JoinTable({ name: 'product_tags' })
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
