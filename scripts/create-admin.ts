// Script to hash and update the admin password if not already hashed
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@admin.com';
  const admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    console.error('Admin user not found');
    process.exit(1);
  }
  // Check if password is already hashed (bcrypt hashes start with $2)
  if (admin.password && !admin.password.startsWith('$2')) {
    const hashed = await bcrypt.hash(admin.password, 10);
    await prisma.user.update({ where: { email }, data: { password: hashed } });
    console.log('Admin password hashed and updated.');
  } else {
    console.log('Admin password is already hashed.');
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 