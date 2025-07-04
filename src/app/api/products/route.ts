import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' },
      include: { images: true },
    });
    return NextResponse.json(products || []);
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/products
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      images = [], // array of base64 strings or URLs
      category,
      price,
      rating,
      description,
      inStock,
      featured = false,
    } = body;

    if (!name || typeof price !== 'number' || !category) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // create product with first image as primary (optional)
    const product = await prisma.product.create({
      data: {
        name,
        price,
        image: Array.isArray(images) && images.length > 0 ? images[0] : undefined,
        category,
        rating: rating ?? 0,
        description,
        inStock: inStock ?? true,
        featured,
        images: {
          create: (Array.isArray(images) ? images : []).map((url: string, index: number) => ({ url, position: index })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[POST /api/products]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 