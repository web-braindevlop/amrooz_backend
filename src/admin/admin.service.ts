import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { Order } from '../orders/order.entity';
import { OrderStatus } from '../common/enums';

const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  async getDashboardStats() {
    const [
      totalProducts,
      activeProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      revenueResult,
    ] = await Promise.all([
      this.products.count(),
      this.products.count({ where: { isActive: true } }),
      this.categories.count(),
      this.orders.count(),
      this.orders.count({ where: { status: OrderStatus.PENDING } }),
      this.products
        .createQueryBuilder('product')
        .where('product.stock <= :threshold', { threshold: LOW_STOCK_THRESHOLD })
        .andWhere('product.isActive = true')
        .getCount(),
      this.orders
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.total), 0)', 'total')
        .where('order.paymentStatus = :status', { status: 'paid' })
        .getRawOne(),
    ]);

    return {
      products: { total: totalProducts, active: activeProducts, lowStock: lowStockProducts },
      categories: { total: totalCategories },
      orders: { total: totalOrders, pending: pendingOrders },
      revenue: Number(revenueResult?.total ?? 0),
    };
  }
}
