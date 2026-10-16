import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { ProductVariant } from '../products/product-variant.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PaymentStatus } from '../common/enums';

/**
 * Allowed order status transitions — prevents jumping e.g. pending → delivered
 * or reopening a cancelled/refunded order. Admin can still force via DB if needed.
 */
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

const FLAT_SHIPPING_RATE = 250;
const CURRENCY = 'PKR';

// In-memory idempotency cache: key → { order, expiresAt }
const idempotencyCache = new Map<
  string,
  { order: Order; expiresAt: number }
>();

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
  ) {}

  /**
   * Generate a secure, unique order number (12-char uppercase hex).
   */
  private generateOrderNumber(): string {
    return crypto.randomBytes(6).toString('hex').toUpperCase();
  }

  /**
   * Parse sale date string to timestamp, mirroring frontend parseSaleInstant logic.
   * Date-only strings (YYYY-MM-DD) get T00:00:00 or T23:59:59 appended based on endOfDayIfDateOnly.
   */
  private parseSaleInstant(value: string | null | undefined, endOfDayIfDateOnly: boolean): number | null {
    if (!value) return null;
    let s = String(value).replace(' ', 'T');
    if (s.length <= 10) s = `${s}T${endOfDayIfDateOnly ? '23:59:59' : '00:00:00'}`;
    const t = new Date(s).getTime();
    return Number.isNaN(t) ? null : t;
  }

  /**
   * Check if a variant's sale price is within its scheduled window.
   */
  private resolveSaleWindowActive(variant: ProductVariant): boolean {
    const now = Date.now();

    const start = this.parseSaleInstant(variant.saleStartDate, false);
    if (start !== null && now < start) return false;

    const end = this.parseSaleInstant(variant.saleEndDate, true);
    if (end !== null && now > end) return false;

    return true;
  }

  /**
   * Resolve the effective price for a variant, matching frontend logic.
   * Returns salePrice if set and within window, otherwise regular price.
   */
  private resolveActualPrice(variant: ProductVariant): number {
    const regular = variant.priceOverride ?? variant.product.price;
    
    if (variant.salePrice != null && this.resolveSaleWindowActive(variant)) {
      return variant.salePrice;
    }
    
    return regular;
  }

  /**
   * Verify that the client-sent unitPrice matches the current DB price.
   * Throws BadRequestException if mismatch > 0.01.
   */
  private async verifyPrices(
    items: Array<{
      productId: number;
      variantId?: number;
      quantity: number;
      unitPrice: number;
    }>,
  ): Promise<void> {
    for (const item of items) {
      let actualPrice: number;
      let label = '';

      if (item.variantId) {
        const variant = await this.variantsRepository.findOne({
          where: { id: item.variantId },
          relations: { product: true },
        });
        if (!variant) {
          throw new BadRequestException(
            `Variant with ID ${item.variantId} not found`,
          );
        }
        // Resolve effective price (including sale price if active)
        actualPrice = this.resolveActualPrice(variant);
        label = `variant ${item.variantId}`;
      } else {
        const product = await this.productsRepository.findOne({
          where: { id: item.productId },
        });
        if (!product) {
          throw new BadRequestException(
            `Product with ID ${item.productId} not found`,
          );
        }
        actualPrice = product.price;
        label = `product ${item.productId}`;
      }

      const diff = Math.abs(item.unitPrice - actualPrice);
      if (diff > 0.01) {
        throw new BadRequestException(
          `Price mismatch for ${label}: expected ${actualPrice}, got ${item.unitPrice}`,
        );
      }
    }
  }

  /**
   * Calculate shipping cost - flat rate for all orders.
   */
  private calculateShipping(subtotal: number): number {
    return FLAT_SHIPPING_RATE;
  }

  /**
   * Fetch product/variant details to populate order item snapshot.
   */
  private async buildOrderItem(
    dto: {
      productId: number;
      variantId?: number;
      quantity: number;
      unitPrice: number;
    },
    orderId: number,
  ): Promise<Partial<OrderItem>> {
    const product = await this.productsRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new BadRequestException(`Product ${dto.productId} not found`);
    }

    let variantLabel: string | null = null;
    let sku = product.sku ?? null;

    if (dto.variantId) {
      const variant = await this.variantsRepository.findOne({
        where: { id: dto.variantId },
      });
      if (!variant) {
        throw new BadRequestException(`Variant ${dto.variantId} not found`);
      }
      const parts: string[] = [];
      if (variant.color) parts.push(variant.color);
      if (variant.size) parts.push(variant.size);
      variantLabel = parts.join(' / ') || null;
      if (variant.sku) sku = variant.sku;
    }

    const subtotal = dto.unitPrice * dto.quantity;

    return {
      orderId,
      productId: dto.productId,
      variantId: dto.variantId ?? null,
      productName: product.name,
      sku,
      variantLabel,
      unitPrice: dto.unitPrice,
      quantity: dto.quantity,
      subtotal,
    };
  }

  /**
   * Create a new order with price verification and idempotency support.
   */
  async create(
    dto: CreateOrderDto,
    idempotencyKey?: string,
  ): Promise<Order> {
    // Check idempotency cache
    if (idempotencyKey) {
      const cached = idempotencyCache.get(idempotencyKey);
      if (cached && Date.now() < cached.expiresAt) {
        return cached.order;
      }
      // Expired entries are cleaned up lazily
      if (cached) {
        idempotencyCache.delete(idempotencyKey);
      }
    }

    // Server-side price verification
    await this.verifyPrices(dto.items);

    // Calculate totals
    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const shippingCost = this.calculateShipping(subtotal);
    const tax = 0;
    const discount = 0;
    const total = subtotal + shippingCost + tax - discount;

    // Generate unique order number (retry on collision)
    let orderNumber: string;
    let attempts = 0;
    while (true) {
      orderNumber = this.generateOrderNumber();
      const existing = await this.ordersRepository.findOne({
        where: { orderNumber },
      });
      if (!existing) break;
      if (++attempts > 5) {
        throw new ConflictException('Failed to generate unique order number');
      }
    }

    // Create order
    const order = this.ordersRepository.create({
      orderNumber,
      email: dto.email,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
      currency: CURRENCY,
      shippingAddress: dto.shippingAddress,
      notes: dto.notes ?? null,
      customerId: null, // Guest checkout
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Create order items
    const itemRows = await Promise.all(
      dto.items.map((item) => this.buildOrderItem(item, savedOrder.id)),
    );
    const items = await this.orderItemsRepository.save(itemRows);
    savedOrder.items = items;

    // Cache for idempotency (10 minutes)
    if (idempotencyKey) {
      const expiresAt = Date.now() + 10 * 60 * 1000;
      idempotencyCache.set(idempotencyKey, { order: savedOrder, expiresAt });
      // Simple cleanup: remove after expiry
      setTimeout(() => {
        idempotencyCache.delete(idempotencyKey);
      }, 10 * 60 * 1000);
    }

    return savedOrder;
  }

  /**
   * Find all orders with pagination + optional search (admin).
   */
  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
  }): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params?.limit) || 25));
    const query = this.ordersRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'item')
      .orderBy('o.createdAt', 'DESC');

    if (params?.status) query.andWhere('o.status = :status', { status: params.status });
    if (params?.paymentStatus)
      query.andWhere('o.paymentStatus = :paymentStatus', { paymentStatus: params.paymentStatus });
    if (params?.search) {
      const term = `%${params.search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(o.orderNumber) LIKE :term OR LOWER(o.email) LIKE :term)',
        { term },
      );
    }

    const skip = (page - 1) * limit;
    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: { items: true },
    });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  /**
   * Securely update order/payment status. Validates status transitions — an
   * invalid transition (e.g. pending → delivered) is rejected with 400.
   */
  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);

    if (dto.status && dto.status !== order.status) {
      const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition order from "${order.status}" to "${dto.status}". Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
        );
      }
      order.status = dto.status;
    }

    if (dto.paymentStatus && dto.paymentStatus !== order.paymentStatus) {
      order.paymentStatus = dto.paymentStatus;
    }

    if (!dto.status && !dto.paymentStatus) {
      throw new BadRequestException('No status or paymentStatus provided');
    }

    return this.ordersRepository.save(order);
  }
}
