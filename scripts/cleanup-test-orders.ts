// cleanup-test-orders.ts
// WARNING: This script will delete ALL OrderItems and Orders from the database.
// Only use in development or test environments!

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('WARNING: This will delete ALL OrderItems and Orders.');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('This script should NOT be run in production!');
  }
  // Optionally require a confirmation flag
  if (process.argv[2] !== '--yes') {
    console.log('Add --yes to the command to confirm deletion.');
    process.exit(1);
  }
  // Delete all OrderItems first
  await prisma.orderItem.deleteMany({});
  // Then delete all Orders
  await prisma.order.deleteMany({});
  console.log('All OrderItems and Orders deleted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 