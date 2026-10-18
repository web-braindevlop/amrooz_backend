import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { Product } from './product.entity';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Order } from '../orders/order.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
  ) {}

  async create(customerId: number, dto: CreateReviewDto): Promise<Review> {
    // Check for existing review by this customer for this product
    const existingReview = await this.reviewRepo.findOne({
      where: { customerId, productId: dto.productId },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this product');
    }

    // Verify product exists
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get customer details
    const customer = await this.customerRepo.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Create review
    const review = this.reviewRepo.create({
      customerId,
      productId: dto.productId,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      authorName: `${customer.firstName} ${customer.lastName?.charAt(0) || ''}.`.trim(),
      isApproved: true,
      isVerifiedPurchase: false, // Can be enhanced to check order history
    });

    const savedReview = await this.reviewRepo.save(review);

    // Update product rating stats
    await this.updateProductRatingStats(dto.productId);

    return savedReview;
  }

  async updateProductRatingStats(productId: number): Promise<void> {
    const reviews = await this.reviewRepo.find({
      where: { productId, isApproved: true },
    });

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

    await this.productRepo.update(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount,
    });
  }

  async findByProduct(productId: number): Promise<Review[]> {
    // Don't load customer relation to avoid PII leak
    // authorName already contains the formatted name
    return this.reviewRepo.find({
      where: { productId, isApproved: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getWeeklySalesCount(productId: number): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.orderItemRepo
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.order', 'order')
      .select('SUM(orderItem.quantity)', 'total')
      .where('orderItem.productId = :productId', { productId })
      .andWhere('order.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .getRawOne();

    return parseInt(result?.total || '0', 10);
  }
}
