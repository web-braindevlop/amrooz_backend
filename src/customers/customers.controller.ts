import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtCustomerAuthGuard } from '../customer-auth/guards/jwt-customer-auth.guard';
import { CurrentCustomer } from '../customer-auth/decorators/current-customer.decorator';
import { CustomersService } from './customers.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Order } from '../orders/order.entity';

@Controller('customers')
@UseGuards(JwtCustomerAuthGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  @Get('me')
  async getProfile(@CurrentCustomer() customer: any) {
    const customerData = await this.customersService.findById(customer.id);
    if (!customerData) {
      throw new NotFoundException('Customer not found');
    }

    return {
      id: customerData.id,
      email: customerData.email,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone,
      isActive: customerData.isActive,
      createdAt: customerData.createdAt,
    };
  }

  @Put('me')
  async updateProfile(
    @CurrentCustomer() customer: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedCustomer = await this.customersService.updateProfile(
      customer.id,
      updateProfileDto,
    );

    return {
      id: updatedCustomer.id,
      email: updatedCustomer.email,
      firstName: updatedCustomer.firstName,
      lastName: updatedCustomer.lastName,
      phone: updatedCustomer.phone,
      isActive: updatedCustomer.isActive,
      createdAt: updatedCustomer.createdAt,
    };
  }

  @Get('me/orders')
  async getOrders(@CurrentCustomer() customer: any) {
    const orders = await this.ordersRepository.find({
      where: { customerId: customer.id },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    return orders;
  }
}
