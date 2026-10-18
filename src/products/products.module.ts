import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Product } from './product.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { Review } from './review.entity';
import { Tag } from '../tags/tag.entity';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from '../orders/order-item.entity';
import { AuthModule } from '../auth/auth.module';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, ProductVariant, Review, Tag, Customer, OrderItem]),
    AuthModule,
    CustomerAuthModule,
  ],
  controllers: [ProductsController, ReviewsController],
  providers: [ProductsService, ReviewsService],
  exports: [ProductsService],
})
export class ProductsModule {}
