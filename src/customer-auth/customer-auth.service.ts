import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, verifyPassword } from '../common/password';
import { Customer } from '../customers/customer.entity';
import { CustomersService } from '../customers/customers.service';
import { RegisterDto } from './dto/register.dto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// Used to burn roughly the same amount of time as a real hash check when the
// account doesn't exist, so login responses don't leak which emails are registered.
const DUMMY_HASH = '$2b$12$q2A63H4zvze/Q9Uqtdh2qu6KdG9HFfxkTUj4YIVmhWB9lGAEEXtDa';

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAndLogin(
    email: string,
    password: string,
  ): Promise<{ customer: Customer; accessToken: string }> {
    const customer = await this.customersService.findByEmailWithPassword(email);

    if (!customer) {
      // Still hash, so response time is close to the "found" path.
      await verifyPassword(DUMMY_HASH, password).catch(() => false);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (customer.lockedUntil && customer.lockedUntil.getTime() > Date.now()) {
      throw new ForbiddenException(
        'Account temporarily locked due to repeated failed login attempts. Try again later.',
      );
    }

    if (!customer.isActive) {
      throw new ForbiddenException('Account is disabled');
    }

    const passwordValid = await verifyPassword(
      customer.passwordHash,
      password,
    ).catch(() => false);

    if (!passwordValid) {
      await this.registerFailedAttempt(customer);
      throw new UnauthorizedException('Invalid email or password');
    }

    customer.failedLoginAttempts = 0;
    customer.lockedUntil = null;
    customer.lastLoginAt = new Date();
    await this.customerRepository.save(customer);

    const accessToken = await this.jwtService.signAsync(
      { sub: customer.id, email: customer.email },
      {
        secret: process.env.JWT_CUSTOMER_SECRET,
        expiresIn: process.env.JWT_CUSTOMER_EXPIRES || '24h',
      },
    );

    return { customer, accessToken };
  }

  private async registerFailedAttempt(customer: Customer) {
    customer.failedLoginAttempts += 1;
    if (customer.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      customer.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    }
    await this.customerRepository.save(customer);
  }

  async register(dto: RegisterDto): Promise<{ customer: Customer; accessToken: string }> {
    // Check if customer already exists
    const existing = await this.customersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await hashPassword(dto.password);

    const customer = this.customerRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      isActive: true,
      acceptsMarketing: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    const savedCustomer = await this.customerRepository.save(customer);

    const accessToken = await this.jwtService.signAsync(
      { sub: savedCustomer.id, email: savedCustomer.email },
      {
        secret: process.env.JWT_CUSTOMER_SECRET,
        expiresIn: process.env.JWT_CUSTOMER_EXPIRES || '24h',
      },
    );

    return { customer: savedCustomer, accessToken };
  }
}
