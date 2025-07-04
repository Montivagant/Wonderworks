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

  // Create categories
  const categoriesData = [
    { name: 'Toys & Games', nameAr: 'ألعاب', slug: 'toys-games', description: 'Fun and educational toys for all ages', image: null },
    { name: 'Home Decor', nameAr: 'ديكور المنزل', slug: 'decor', description: 'Beautiful decor items for your home', image: null },
    { name: 'Home', nameAr: 'المنزل', slug: 'home', description: 'Home essentials', image: null },
    { name: 'Stationary', nameAr: 'مستلزمات مكتبية', slug: 'stationary', description: 'Office and school supplies', image: null },
  ];
  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = created;
  }

  // Create test products if none exist
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    console.log('Creating test products...');
    const redDotBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    const products = [
      {
        name: 'Test Product with Image',
        nameAr: 'منتج اختبار بصورة',
        price: 9.99,
        image: redDotBase64,
        rating: 5.0,
        description: 'This is a test product with a red dot image.',
        inStock: true,
        featured: true,
        categoryId: categories['toys-games'].id,
      },
      {
        name: 'Modern Wall Art Canvas',
        nameAr: 'لوحة فنية حديثة',
        price: 89.99,
        image: null,
        rating: 4.6,
        description: 'Contemporary canvas art to transform your space',
        inStock: true,
        featured: true,
        categoryId: categories['decor'].id,
      },
      {
        name: 'Smart Kitchen Organizer',
        nameAr: 'منظم مطبخ ذكي',
        price: 45.99,
        image: null,
        rating: 4.7,
        description: 'Revolutionary kitchen storage solution',
        inStock: true,
        featured: true,
        categoryId: categories['home'].id,
      },
      {
        name: 'Premium Pet Bed',
        nameAr: 'سرير فاخر للحيوانات الأليفة',
        price: 39.99,
        image: null,
        rating: 4.9,
        description: 'Luxurious comfort for your beloved pets',
        inStock: true,
        featured: true,
        categoryId: categories['home'].id,
      },
      {
        name: 'Ergonomic Office Chair',
        nameAr: 'كرسي مكتب مريح',
        price: 199.99,
        image: null,
        rating: 4.5,
        description: 'Comfortable and supportive office chair',
        inStock: true,
        featured: true,
        categoryId: categories['stationary'].id,
      },
    ];
    for (const product of products) {
      await prisma.product.create({ data: product });
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