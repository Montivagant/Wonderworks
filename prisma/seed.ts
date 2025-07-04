// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user if it doesn't exist
  const adminEmail = 'admin@wonderworks.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isVerified: true,
      },
    });
    console.log('Admin user created');
  } else {
    if (!existingAdmin.isVerified) {
      await prisma.user.update({ where: { email: adminEmail }, data: { isVerified: true } });
      console.log('Admin user verified flag updated');
    } else {
      console.log('Admin user already exists and verified');
    }
  }

  // Create test products if none exist
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    console.log('Creating test products...');
    
    // Red dot image for testing
    const redDotBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    
    const products = [
      {
        name: 'Test Product with Image',
        price: 9.99,
        image: redDotBase64,
        category: 'toys-games',
        rating: 5.0,
        description: 'This is a test product with a red dot image.',
        inStock: true,
        featured: true,
      },
      {
        name: 'Modern Wall Art Canvas',
        price: 89.99,
        image: null,
        category: 'decor',
        rating: 4.6,
        description: 'Contemporary canvas art to transform your space',
        inStock: true,
        featured: true,
      },
      {
        name: 'Smart Kitchen Organizer',
        price: 45.99,
        image: null,
        category: 'home',
        rating: 4.7,
        description: 'Revolutionary kitchen storage solution',
        inStock: true,
        featured: true,
      },
      {
        name: 'Premium Pet Bed',
        price: 39.99,
        image: null,
        category: 'home',
        rating: 4.9,
        description: 'Luxurious comfort for your beloved pets',
        inStock: true,
        featured: true,
      },
      {
        name: 'Ergonomic Office Chair',
        price: 199.99,
        image: null,
        category: 'stationary',
        rating: 4.5,
        description: 'Comfortable and supportive office chair',
        inStock: true,
        featured: true,
      },
    ];

    for (const product of products) {
      await prisma.product.create({
        data: product,
      });
    }
    
    console.log(`Created ${products.length} test products`);
  } else {
    console.log(`${productCount} products already exist`);
  }

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 