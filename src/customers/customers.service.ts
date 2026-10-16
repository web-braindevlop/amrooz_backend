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
   * Find a customer by ID.
   */
  async findById(id: number): Promise<Customer | null> {
    return this.customersRepository.findOne({
      where: { id },
    });
  }

  /**
   * Find a customer by email with password hash included.
   */
  async findByEmailWithPassword(email: string): Promise<Customer | null> {
    return this.customersRepository
      .createQueryBuilder('customer')
      .addSelect('customer.passwordHash')
      .where('customer.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  /**
   * Update customer profile data.
   */
  async updateProfile(
    id: number,
    dto: { firstName?: string; lastName?: string; phone?: string },
  ): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (dto.firstName !== undefined) customer.firstName = dto.firstName;
    if (dto.lastName !== undefined) customer.lastName = dto.lastName;
    if (dto.phone !== undefined) customer.phone = dto.phone;

    return this.customersRepository.save(customer);
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

    // Fisher-Yates shuffle to avoid predictable pattern
    const chars = password.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = crypto.randomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }

  /**
   * Create a new customer from order checkout data.
   * Returns both the customer record and the plain-text password.
   * Handles race condition: if two concurrent orders create the same customer,
   * retry by fetching the existing record.
   */
  async createFromOrder(
    email: string,
    firstName: string,
    phone: string,
  ): Promise<{ customer: Customer; plainPassword: string | null }> {
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

    try {
      const savedCustomer = await this.customersRepository.save(customer);
      return { customer: savedCustomer, plainPassword };
    } catch (error) {
      // Handle unique constraint violation (race condition)
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        // Another request created this customer — fetch existing record
        const existing = await this.findByEmail(email);
        if (existing) {
          // Return existing customer but with null password (we don't know theirs)
          // The caller should treat this as an existing customer
          return { customer: existing, plainPassword: null };
        }
      }
      // Re-throw any other error
      throw error;
    }
  }
}
