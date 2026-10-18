import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtCustomerAuthGuard } from '../customer-auth/guards/jwt-customer-auth.guard';
import { GetCustomer } from '../customer-auth/decorators/get-customer.decorator';

@Controller('products')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':productId/reviews')
  @UseGuards(JwtCustomerAuthGuard)
  async createReview(
    @Param('productId', ParseIntPipe) productId: number,
    @GetCustomer() customer: any,
    @Body() dto: CreateReviewDto,
  ) {
    // Override productId from body with path parameter
    dto.productId = productId;
    return this.reviewsService.create(customer.id, dto);
  }

  @Get(':productId/reviews')
  async getProductReviews(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.findByProduct(productId);
  }

  @Get(':productId/weekly-sales')
  async getWeeklySales(@Param('productId', ParseIntPipe) productId: number) {
    const count = await this.reviewsService.getWeeklySalesCount(productId);
    return { count };
  }
}
