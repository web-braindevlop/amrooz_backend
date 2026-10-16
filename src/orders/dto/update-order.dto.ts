import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../../common/enums';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
