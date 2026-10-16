import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { hashPassword } from '../common/password';
import * as crypto from 'crypto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  /**
   * Find a customer by email address.
   */
  async findByEmail(email: string): Promise<Customer | null> {
    return this.customersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Generate a secure 12-character password with mixed case, numbers, and special chars.
   */
  private generateSecurePassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + special;

    // Ensure at least one of each type
    let password = '';
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += special[crypto.randomInt(special.length)];

    // Fill remaining 8 characters
    for (let i = 4; i < 12; i++) {
      password += allChars[crypto.randomInt(allChars.length)];
    }

    // Shuffle to avoid predictable pattern
    return password
      .split('')
      .sort(() => crypto.randomInt(3) - 1)
      .join('');
  }

  /**
   * Create a new customer from order checkout data.
   * Returns both the customer record and the plain-text password.
   */
  async createFromOrder(
    email: string,
    firstName: string,
    phone: string,
  ): Promise<{ customer: Customer; plainPassword: string }> {
    const plainPassword = this.generateSecurePassword();
    const passwordHash = await hashPassword(plainPassword);

    const customer = this.customersRepository.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      phone,
      isActive: true,
      acceptsMarketing: false,
    });

    const savedCustomer = await this.customersRepository.save(customer);

    return { customer: savedCustomer, plainPassword };
  }
}
