import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// POST - Bulk actions on categories (delete)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No category IDs provided' }, { status: 400 });
    }
    if (action !== 'delete') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Prevent deleting categories that have products assigned
    const products = await prisma.product.findMany({
      where: { categoryId: { in: ids } },
      select: { categoryId: true }
    });
    const blockedIds = products.map(p => p.categoryId);
    const deletableIds = ids.filter((id: string) => !blockedIds.includes(id));
    if (deletableIds.length > 0) {
      await prisma.category.deleteMany({ where: { id: { in: deletableIds } } });
    }
    return NextResponse.json({
      message: 'Bulk delete completed',
      deleted: deletableIds,
      blocked: blockedIds
    });
  } catch (error: any) {
    console.error('Bulk category action error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 