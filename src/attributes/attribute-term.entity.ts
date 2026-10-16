import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Attribute } from './attribute.entity';

/**
 * A selectable value belonging to an Attribute (e.g. "Red" under "Color",
 * or "Large" under "Size"). Slugs are unique within their attribute.
 */
@Entity('attribute_terms')
@Index(['attributeId', 'slug'], { unique: true })
export class AttributeTerm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 140 })
  slug: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Index()
  @Column()
  attributeId: number;

  @ManyToOne(() => Attribute, (attribute) => attribute.terms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
