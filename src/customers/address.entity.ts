import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Customer } from './customer.entity';
import { AddressType } from '../common/enums';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AddressType, default: AddressType.SHIPPING })
  type: AddressType;

  @Column({ length: 120 })
  fullName: string;

  @Column({ length: 200 })
  line1: string;

  @Column({ length: 200, nullable: true })
  line2: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20 })
  postalCode: string;

  @Column({ length: 100, default: 'Pakistan' })
  country: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ default: false })
  isDefault: boolean;

  @Index()
  @Column()
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;
}
