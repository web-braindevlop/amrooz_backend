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

  @Column({ default: 0 })
  failedLoginAttempts: number;

  // Set when failedLoginAttempts crosses the threshold; login is rejected until this passes.
  @Column({ type: 'datetime', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @Column({ length: 255, nullable: true, select: false })
  resetPasswordToken: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetPasswordExpires: Date | null;

  @OneToMany(() => Address, (address) => address.customer, { cascade: true })
  addresses: Address[];

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
