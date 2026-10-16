import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomersService } from '../../customers/customers.service';

@Injectable()
export class JwtCustomerStrategy extends PassportStrategy(Strategy, 'jwt-customer') {
  constructor(private readonly customersService: CustomersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_CUSTOMER_SECRET,
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const customer = await this.customersService.findById(payload.sub);
    if (!customer || !customer.isActive) {
      throw new UnauthorizedException();
    }
    return { id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName };
  }
}
