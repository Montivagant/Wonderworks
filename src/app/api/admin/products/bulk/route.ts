import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// POST - Bulk actions on products (delete, feature, unfeature)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
    }
    if (!['delete', 'feature', 'unfeature'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (action === 'delete') {
      // Check for products that cannot be deleted (e.g., in orders)
      const orderItems = await prisma.orderItem.findMany({
        where: { productId: { in: ids } },
        select: { productId: true }
      });
      const blockedIds = orderItems.map(item => item.productId);
      const deletableIds = ids.filter((id: number) => !blockedIds.includes(id));
      if (deletableIds.length > 0) {
        await prisma.product.deleteMany({ where: { id: { in: deletableIds } } });
      }
      return NextResponse.json({
        message: 'Bulk delete completed',
        deleted: deletableIds,
        blocked: blockedIds
      });
    }

    if (action === 'feature') {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { featured: true }
      });
      return NextResponse.json({ message: 'Bulk feature completed', featured: ids });
    }

    if (action === 'unfeature') {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { featured: false }
      });
      return NextResponse.json({ message: 'Bulk unfeature completed', unfeatured: ids });
    }

    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  } catch (error: any) {
    console.error('Bulk product action error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 