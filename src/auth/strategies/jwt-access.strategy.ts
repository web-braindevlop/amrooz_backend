import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';

function extractFromCookie(req: Request): string | null {
  return req?.cookies?.access_token || null;
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: extractFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const admin = await this.authService.findById(payload.sub);
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException();
    }
    return { id: admin.id, email: admin.email, name: admin.name };
  }
}
