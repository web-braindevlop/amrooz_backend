import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Customer } from '../customers/customer.entity';
import { CustomersModule } from '../customers/customers.module';
import { MailModule } from '../mail/mail.module';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { JwtCustomerStrategy } from './strategies/jwt-customer.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    CustomersModule,
    MailModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, JwtCustomerStrategy],
  exports: [CustomerAuthService],
})
export class CustomerAuthModule {}
