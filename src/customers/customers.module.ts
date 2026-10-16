import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { Address } from './address.entity';
import { CustomersService } from './customers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Address])],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
