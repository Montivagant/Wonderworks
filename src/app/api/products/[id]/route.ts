import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) return new NextResponse('Invalid id', { status: 400 });
  try {
    const product = await prisma.product.findUnique({ 
      where: { id: numId },
      include: {
        images: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    });
    if (!product) return new NextResponse('Not found', { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return new NextResponse('Server error', { status: 500 });
  }
}

// PUT /api/products/[id] - update product
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) return new NextResponse('Invalid id', { status: 400 });

    const body = await request.json();
    const {
      name,
      images = [],
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

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: numId },
      data: {
        name,
        price,
        image: Array.isArray(images) && images.length > 0 ? images[0] : undefined,
        category,
        rating: rating ?? 0,
        description,
        inStock: inStock ?? true,
        featured,
        // Update images if provided
        ...(Array.isArray(images) && images.length > 0 && {
          images: {
            deleteMany: {},
            create: images.map((url: string, index: number) => ({ url, position: index })),
          },
        }),
      },
      include: { images: true },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('[PUT /api/products/[id]]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) return new NextResponse('Invalid id', { status: 400 });
  try {
    await prisma.product.delete({ where: { id: numId } });
    return new NextResponse('Deleted', { status: 204 });
  } catch (err) {
    console.error(err);
    return new NextResponse('Server error', { status: 500 });
  }
} 