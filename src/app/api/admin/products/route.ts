import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET - Fetch all products (optionally include archived)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(request.url);
    const showArchived = url.searchParams.get('archived') === 'true';
    const products = await prisma.product.findMany({
      where: showArchived ? {} : { archived: false },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, stock, image, images, featured, categoryId, isFlashDeal, isRecommended, flashDealEndTime, originalPrice } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Name, price, and categoryId are required' }, { status: 400 });
    }

    if (price <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
    }

    if (stock < 0) {
      return NextResponse.json({ error: 'Stock cannot be negative' }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category does not exist' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        image: image?.trim() || null,
        category: {
          connect: { id: categoryId }
        },
        stock: parseInt(stock),
        inStock: parseInt(stock) > 0,
        featured: featured || false,
        isFlashDeal,
        isRecommended,
        flashDealEndTime: flashDealEndTime ? new Date(flashDealEndTime) : null,
        originalPrice,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, price, stock, featured, categoryId, isFlashDeal, isRecommended, flashDealEndTime, originalPrice, archived } = body;

    if (!id || !name || !price || !categoryId) {
      return NextResponse.json({ error: 'ID, name, price, and categoryId are required' }, { status: 400 });
    }

    if (price <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
    }

    if (stock < 0) {
      return NextResponse.json({ error: 'Stock cannot be negative' }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category does not exist' }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        image: image?.trim() || null,
        category: {
          connect: { id: categoryId }
        },
        stock: parseInt(stock),
        inStock: parseInt(stock) > 0,
        featured: featured || false,
        isFlashDeal,
        isRecommended,
        flashDealEndTime: flashDealEndTime ? new Date(flashDealEndTime) : null,
        originalPrice,
        archived: archived ?? false,
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product is in any orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: parseInt(id) }
    });

    if (orderItems) {
      return NextResponse.json({ 
        error: 'Cannot delete product that has been ordered. Please mark as out of stock instead.' 
      }, { status: 409 });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    // Prisma foreign key constraint error
    if (error.code === 'P2003') {
      return NextResponse.json({
        error: 'Cannot delete product that has been ordered or is referenced elsewhere. Please mark as out of stock or archive instead.'
      }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 