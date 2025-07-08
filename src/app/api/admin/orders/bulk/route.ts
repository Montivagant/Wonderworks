import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// POST - Bulk actions on orders (cancel, delete, markShipped, markDelivered)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No order IDs provided' }, { status: 400 });
    }
    if (!['cancel', 'delete', 'markShipped', 'markDelivered'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (action === 'cancel') {
      await prisma.order.updateMany({
        where: { id: { in: ids } },
        data: { status: 'CANCELLED' }
      });
      return NextResponse.json({ message: 'Bulk cancel completed', updated: ids });
    }

    if (action === 'markShipped') {
      await prisma.order.updateMany({
        where: { id: { in: ids } },
        data: { status: 'SHIPPED' }
      });
      return NextResponse.json({ message: 'Bulk mark shipped completed', updated: ids });
    }

    if (action === 'markDelivered') {
      await prisma.order.updateMany({
        where: { id: { in: ids } },
        data: { status: 'DELIVERED' }
      });
      return NextResponse.json({ message: 'Bulk mark delivered completed', updated: ids });
    }

    if (action === 'delete') {
      await prisma.order.deleteMany({ where: { id: { in: ids } } });
      return NextResponse.json({ message: 'Bulk delete completed', deleted: ids });
    }

    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  } catch (error: any) {
    console.error('Bulk order action error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 