import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Address } from './address.entity';
import { Order } from '../orders/order.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 180 })
  email: string;

  // Never store plain passwords — this holds a bcrypt/argon2 hash.
  @Column({ nullable: true, select: false })
  passwordHash: string;

  @Column({ length: 80 })
  firstName: string;

  @Column({ length: 80, nullable: true })
  lastName: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  acceptsMarketing: boolean;

  @OneToMany(() => Address, (address) => address.customer, { cascade: true })
  addresses: Address[];

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
