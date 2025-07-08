import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sanitizeImageUrl } from '@/utils/imageUtils';

// GET /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' },
      include: { images: true, category: true },
    });
    return NextResponse.json(products || []);
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST /api/products
export async function POST(req: Request) {
  const url = req.nextUrl?.pathname || '';
  if (url.endsWith('/reset')) {
    // Only allow admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
    }
    // Delete all products
    await prisma.product.deleteMany({});
    // Insert default products
    const defaultProducts = [
      {
        name: 'Test Product with Data URL Image',
        price: 9.99,
        images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='],
        category: 'toys-games',
        rating: 5,
        description: 'This is a test product with a red square image. If you can see a red square, the image pipeline works!',
        inStock: true,
      },
      {
        name: 'Modern Wall Art Canvas',
        price: 89.99,
        images: ['/placeholder.svg'],
        category: 'decor',
        rating: 4.6,
        description: 'Contemporary canvas art to transform your space',
        inStock: true,
      },
      {
        name: 'Smart Kitchen Organizer',
        price: 45.99,
        images: ['/placeholder.svg'],
        category: 'home',
        rating: 4.7,
        description: 'Revolutionary kitchen storage solution',
        inStock: true,
      }
    ];
    const created = await prisma.product.createMany({ data: defaultProducts });
    const products = await prisma.product.findMany();
    return new Response(JSON.stringify(products), { status: 200 });
  }
  try {
    const body = await req.json();
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

    // Validate required fields with more detailed checks
    if (!name || name.trim().length === 0) {
      return new NextResponse(JSON.stringify({
        error: 'Validation Error',
        details: 'Product name is required and cannot be empty'
      }), { status: 400 });
    }

    if (typeof price !== 'number' || isNaN(price) || price < 0) {
      return new NextResponse(JSON.stringify({
        error: 'Validation Error',
        details: 'Price must be a valid non-negative number'
      }), { status: 400 });
    }

    if (!category || category.trim().length === 0) {
      return new NextResponse(JSON.stringify({
        error: 'Validation Error',
        details: 'Category is required and cannot be empty'
      }), { status: 400 });
    }

    // Validate images
    const validImages = (Array.isArray(images) ? images : [])
      .map((url: string) => {
        // Use the sanitization function from imageUtils
        const sanitizedUrl = sanitizeImageUrl(url);
        return sanitizedUrl;
      })
      .filter((url: string) => url !== '');

    if (validImages.length === 0) {
      return new NextResponse(JSON.stringify({
        error: 'Validation Error',
        details: 'At least one valid image is required'
      }), { status: 400 });
    }

    // Find or create category
    let categoryRecord = await prisma.category.findFirst({
      where: { 
        OR: [
          { name: category.trim() },
          { slug: category.trim().toLowerCase().replace(/\s+/g, '-') }
        ]
      }
    });

    // If category doesn't exist, create it
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          name: category.trim(),
          slug: category.trim().toLowerCase().replace(/\s+/g, '-')
        }
      });
    }

    // create product with first image as primary (optional)
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price,
        image: validImages[0],
        categoryId: categoryRecord.id,
        rating: rating ?? 0,
        description: description?.trim(),
        inStock: inStock ?? true,
        featured,
        images: {
          create: validImages.map((url: string, index: number) => ({ 
            url, 
            position: index 
          })),
        },
      },
      include: { images: true, category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[POST /api/products]', error);
    // Log the specific error details
    if (error instanceof Error) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    }
    
    // Log the incoming request body for debugging
    const body = await req.json();
    console.error('Incoming Product Data:', JSON.stringify(body, null, 2));
    
    return new NextResponse(JSON.stringify({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error',
      requestBody: body
    }), { status: 500 });
  }
} 