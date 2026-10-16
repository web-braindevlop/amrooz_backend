import { hashPassword } from './common/password';
import { AppDataSource } from './data-source';
import { Admin } from './admin/admin.entity';

/**
 * Creates (or resets the password of) the first admin account. There is no public
 * signup endpoint by design, so this CLI is the only way to provision admin access.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-passphrase' ADMIN_NAME="Your Name" npm run seed:admin
 */
async function run() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.error(
      'Missing ADMIN_EMAIL / ADMIN_PASSWORD environment variables.\n' +
        "Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-passphrase' npm run seed:admin",
    );
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('ADMIN_PASSWORD must be at least 12 characters long.');
    process.exit(1);
  }

  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Admin);

  const passwordHash = await hashPassword(password);
  const normalizedEmail = email.toLowerCase().trim();

  let admin = await repo.findOne({ where: { email: normalizedEmail } });
  if (admin) {
    admin.passwordHash = passwordHash;
    admin.name = name;
    admin.isActive = true;
    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
    admin.refreshTokenHash = null;
    await repo.save(admin);
    console.log(`Updated existing admin: ${normalizedEmail}`);
  } else {
    admin = repo.create({ email: normalizedEmail, passwordHash, name });
    await repo.save(admin);
    console.log(`Created admin: ${normalizedEmail}`);
  }

  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});
