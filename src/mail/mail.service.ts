import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface OrderConfirmationParams {
  to: string;
  orderNumber: string;
  items: Array<{
    name: string;
    variant: string | null;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  shippingAddress: Record<string, any>;
  generatedPassword: string | null;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendOrderConfirmation(params: OrderConfirmationParams): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: params.to,
        subject: `Order Confirmed – #${params.orderNumber} | Amrooz Collection`,
        template: './order-confirmation',
        context: {
          customerEmail: params.to,
          orderNumber: params.orderNumber,
          items: params.items,
          subtotal: params.subtotal,
          shippingCost: params.shippingCost,
          total: params.total,
          currency: params.currency,
          shippingAddress: params.shippingAddress,
          generatedPassword: params.generatedPassword,
        },
      });
      this.logger.log(`Order confirmation email sent to ${params.to} for order #${params.orderNumber}`);
    } catch (error) {
      // Log but do NOT throw — email failure should not fail the order
      // Sanitize error to avoid leaking sensitive data (e.g., password in stack trace)
      this.logger.error(
        `Failed to send order confirmation email to ${params.to} for order #${params.orderNumber}: ${error.message}`,
      );
    }
  }
}
