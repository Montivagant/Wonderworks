// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed categories first
  const categoryData = [
    { 
      name: 'Toys & Games', 
      slug: 'toys-and-games',
      description: 'Fun and educational toys for all ages'
    },
    { 
      name: 'Decor', 
      slug: 'decor',
      description: 'Beautiful items to enhance your living space'
    },
    { 
      name: 'Household', 
      slug: 'household',
      description: 'Practical items for home and daily life'
    },
    { 
      name: 'Pet Care', 
      slug: 'pet-care',
      description: 'Essentials for your furry friends'
    },
    { 
      name: 'Stationary', 
      slug: 'stationary',
      description: 'Writing and office supplies'
    }
  ];

  // Create categories one by one to avoid duplicates
  const categories = {};
  for (const category of categoryData) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: category.slug }
    });
    
    if (!existingCategory) {
      const createdCategory = await prisma.category.create({
        data: category
      });
      categories[category.slug] = createdCategory;
      console.log(`Created category: ${category.name} (${category.slug})`);
    } else {
      categories[category.slug] = existingCategory;
      console.log(`Category already exists: ${category.name} (${category.slug})`);
    }
  }

  // Verify all categories were created
  console.log('Available categories:', Object.keys(categories));
  for (const [slug, category] of Object.entries(categories)) {
    if (!category || !category.id) {
      console.error(`Missing category data for: ${slug}`);
      continue;
    }
    console.log(`Category ${slug}: ID = ${category.id}`);
  }

  // Create admin user if it doesn't exist
  const adminEmail = 'admin@admin.com';
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
    const redDotBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    
    // Only create products if we have valid categories
    const validCategories = Object.values(categories).filter(cat => cat && cat.id);
    if (validCategories.length === 0) {
      console.log('No valid categories found, skipping product creation');
    } else {
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
          categoryId: validCategories[0]?.id,
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
          categoryId: validCategories[1]?.id || validCategories[0]?.id,
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
          categoryId: validCategories[2]?.id || validCategories[0]?.id,
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
          categoryId: validCategories[3]?.id || validCategories[0]?.id,
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
          categoryId: validCategories[4]?.id || validCategories[0]?.id,
        },
      ];
      
      let createdCount = 0;
      for (const product of products) {
        if (!product.categoryId) {
          console.warn(`Skipping product '${product.name}' due to missing categoryId.`);
          continue;
        }
        try {
          await prisma.product.create({ data: product });
          createdCount++;
          console.log(`Created product: ${product.name}`);
        } catch (error) {
          console.error(`Failed to create product '${product.name}':`, error);
        }
      }
      console.log(`Created ${createdCount} test products`);
    }
  } else {
    console.log(`${productCount} products already exist`);
  }

  // Create test orders if none exist
  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    console.log('Creating test orders...');
    
    // Get admin user and some products
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    const products = await prisma.product.findMany({
      take: 3
    });
    
    if (adminUser && products.length > 0) {
      // Create test orders
      const testOrders = [
        {
          userId: adminUser.id,
          total: 29.97,
          status: 'PENDING',
          paymentMethod: 'COD',
          items: [
            { productId: products[0].id, quantity: 3, price: 9.99 }
          ]
        },
        {
          userId: adminUser.id,
          total: 89.99,
          status: 'PROCESSING',
          paymentMethod: 'CREDIT_CARD',
          items: [
            { productId: products[1]?.id || products[0].id, quantity: 1, price: 89.99 }
          ]
        },
        {
          userId: adminUser.id,
          total: 85.98,
          status: 'SHIPPED',
          paymentMethod: 'FAWRY',
          items: [
            { productId: products[2]?.id || products[0].id, quantity: 1, price: 45.99 },
            { productId: products[0].id, quantity: 4, price: 9.99 }
          ]
        },
        {
          userId: adminUser.id,
          total: 239.98,
          status: 'DELIVERED',
          paymentMethod: 'VODAFONE_CASH',
          items: [
            { productId: products[2]?.id || products[0].id, quantity: 1, price: 199.99 },
            { productId: products[1]?.id || products[0].id, quantity: 1, price: 39.99 }
          ]
        }
      ];
      
      let orderCreatedCount = 0;
      for (const orderData of testOrders) {
        try {
          const { items, ...orderInfo } = orderData;
          const order = await prisma.order.create({
            data: orderInfo
          });
          
          // Create order items
          for (const item of items) {
            await prisma.orderItem.create({
              data: {
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }
            });
          }
          orderCreatedCount++;
          console.log(`Created order: ${order.id}`);
        } catch (error) {
          console.error('Failed to create order:', error);
        }
      }
      
      console.log(`Created ${orderCreatedCount} test orders`);
    } else {
      console.log('Skipping test orders - admin user or products not found');
    }
  } else {
    console.log(`${orderCount} orders already exist`);
  }

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 