import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories || []);
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json([], { status: 200 });
  }
}

// Optional: POST route to create categories if needed
export async function POST(req: Request) {
  try {
    const { name, description, image } = await req.json();

    if (!name || name.trim().length === 0) {
      return new NextResponse(JSON.stringify({
        error: 'Validation Error',
        details: 'Category name is required and cannot be empty'
      }), { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description?.trim(),
        image,
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('[POST /api/categories]', error);
    return new NextResponse(JSON.stringify({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
} 