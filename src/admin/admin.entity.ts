import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 180 })
  email: string;

  // bcrypt hash — never store or log the plain password.
  @Column({ select: false })
  passwordHash: string;

  @Column({ length: 120 })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  // Set when failedLoginAttempts crosses the threshold; login is rejected until this passes.
  @Column({ type: 'datetime', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  // Hash of the current refresh token (rotated on every refresh/login), so a stolen
  // DB row can't be replayed as a session and old refresh tokens die on rotation.
  @Column({ select: false, nullable: true })
  refreshTokenHash: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
