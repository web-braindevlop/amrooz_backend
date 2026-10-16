import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { numeric } from '../common/numeric.transformer';

/**
 * A specific purchasable variation of a product (e.g. Size M / Navy).
 * Stock is tracked per variant; priceOverride lets a variant cost more.
 */
@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 40, nullable: true })
  size: string;

  @Column({ length: 60, nullable: true })
  color: string;

  @Column({ length: 9, nullable: true })
  colorHex: string;

  @Column({ length: 90, nullable: true })
  sku: string;

  @Column({ default: 0 })
  stock: number;

  // Regular price override for this variation. Null means it inherits the
  // product's own regular price.
  @Column('decimal', { precision: 10, scale: 2, nullable: true, transformer: numeric })
  priceOverride: number;

  // Discounted price override for this variation. Null means it inherits
  // the product's own sale price (if any) unless priceOverride is set, in
  // which case the variation has no sale unless this is also set.
  @Column('decimal', { precision: 10, scale: 2, nullable: true, transformer: numeric })
  salePrice: number;

  // Optional window the sale price is active within (inclusive). Either end
  // may be left unset — no start means it's already active, no end means it
  // never expires. Stored as a local ISO datetime string
  // ("YYYY-MM-DDTHH:mm:ss", no timezone) so the exact wall-clock start/end
  // round-trips without timezone shifts. Storefront pricing ignores salePrice
  // outside this window.
  @Column({ type: 'varchar', length: 32, nullable: true })
  saleStartDate: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  saleEndDate: string | null;

  @Column({ default: true })
  isActive: boolean;

  // A single photo specific to this exact variation (e.g. a size that fits
  // differently, shot separately). Optional — falls back to the color's
  // shared gallery (ProductImage.color) on the storefront when unset.
  @Column({ nullable: true })
  imageUrl: string;

  @Index()
  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
