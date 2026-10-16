import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { hashPassword, verifyPassword } from '../common/password';
import { Admin } from '../admin/admin.entity';
import { LoginDto } from './dto/login.dto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// Used to burn roughly the same amount of time as a real hash check when the
// account doesn't exist, so login responses don't leak which emails are registered.
const DUMMY_HASH = '$2b$12$q2A63H4zvze/Q9Uqtdh2qu6KdG9HFfxkTUj4YIVmhWB9lGAEEXtDa';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  private accessTokenSecret() {
    return process.env.JWT_ACCESS_SECRET;
  }

  private refreshTokenSecret() {
    return process.env.JWT_REFRESH_SECRET;
  }

  async validateAndLogin(dto: LoginDto): Promise<{ admin: Admin; tokens: AuthTokens }> {
    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .addSelect('admin.passwordHash')
      .where('admin.email = :email', { email: dto.email.toLowerCase().trim() })
      .getOne();

    if (!admin) {
      // Still hash, so response time is close to the "found" path.
      await verifyPassword(DUMMY_HASH, dto.password).catch(() => false);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (admin.lockedUntil && admin.lockedUntil.getTime() > Date.now()) {
      throw new ForbiddenException(
        'Account temporarily locked due to repeated failed login attempts. Try again later.',
      );
    }

    if (!admin.isActive) {
      throw new ForbiddenException('Account is disabled');
    }

    const passwordValid = await verifyPassword(admin.passwordHash, dto.password).catch(() => false);

    if (!passwordValid) {
      await this.registerFailedAttempt(admin);
      throw new UnauthorizedException('Invalid email or password');
    }

    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
    admin.lastLoginAt = new Date();

    const tokens = await this.issueTokens(admin);
    await this.adminRepository.save(admin);

    return { admin, tokens };
  }

  private async registerFailedAttempt(admin: Admin) {
    admin.failedLoginAttempts += 1;
    if (admin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      admin.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    }
    await this.adminRepository.save(admin);
  }

  /** Signs a fresh access/refresh pair and persists the refresh token's hash for rotation checks. */
  private async issueTokens(admin: Admin): Promise<AuthTokens> {
    const jti = crypto.randomUUID();

    const accessToken = await this.jwtService.signAsync(
      { sub: admin.id, email: admin.email },
      { secret: this.accessTokenSecret(), expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: admin.id, jti },
      { secret: this.refreshTokenSecret(), expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' },
    );

    admin.refreshTokenHash = await hashPassword(refreshToken);
    return { accessToken, refreshToken };
  }

  async refresh(presentedToken: string): Promise<AuthTokens> {
    let payload: { sub: number; jti: string };
    try {
      payload = await this.jwtService.verifyAsync(presentedToken, {
        secret: this.refreshTokenSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .addSelect('admin.refreshTokenHash')
      .where('admin.id = :id', { id: payload.sub })
      .getOne();

    if (!admin || !admin.refreshTokenHash) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const matches = await verifyPassword(admin.refreshTokenHash, presentedToken).catch(() => false);
    if (!matches) {
      // Token reuse / theft signal — kill the session so a stolen token can't be replayed.
      admin.refreshTokenHash = null;
      await this.adminRepository.save(admin);
      throw new UnauthorizedException('Invalid or expired session');
    }

    if (!admin.isActive) {
      throw new ForbiddenException('Account is disabled');
    }

    const tokens = await this.issueTokens(admin);
    await this.adminRepository.save(admin);
    return tokens;
  }

  async logout(adminId: number): Promise<void> {
    await this.adminRepository.update({ id: adminId }, { refreshTokenHash: null });
  }

  async findById(id: number): Promise<Admin | null> {
    return this.adminRepository.findOne({ where: { id } });
  }
}
