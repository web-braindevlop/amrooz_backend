import * as bcrypt from 'bcryptjs';

// Pure-JS bcrypt — argon2 needs a native addon compiled via node-gyp/Python,
// which isn't available on Hostinger's shared-hosting Node.js build environment.
const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// Argument order matches the old argon2.verify(hash, plain) call sites.
export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
