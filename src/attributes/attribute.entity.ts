import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { AttributeTerm } from './attribute-term.entity';

/**
 * A global product attribute (e.g. "Color", "Size") — the WooCommerce
 * "Attributes" concept. Each attribute owns a set of selectable terms.
 */
@Entity('attributes')
export class Attribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 140 })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => AttributeTerm, (term) => term.attribute, { cascade: true })
  terms: AttributeTerm[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
