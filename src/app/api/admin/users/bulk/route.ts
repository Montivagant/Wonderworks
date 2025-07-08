import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// POST - Bulk actions on users (delete, makeAdmin, makeCustomer)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids, action } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No user IDs provided' }, { status: 400 });
    }
    if (!['delete', 'makeAdmin', 'makeCustomer'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (action === 'delete') {
      // Prevent deleting self
      const filteredIds = ids.filter((id: number) => id !== session.user.id);
      await prisma.user.deleteMany({ where: { id: { in: filteredIds } } });
      return NextResponse.json({ message: 'Bulk delete completed', deleted: filteredIds });
    }

    if (action === 'makeAdmin') {
      await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { role: 'ADMIN' }
      });
      return NextResponse.json({ message: 'Bulk make admin completed', updated: ids });
    }

    if (action === 'makeCustomer') {
      await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { role: 'CUSTOMER' }
      });
      return NextResponse.json({ message: 'Bulk make customer completed', updated: ids });
    }

    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  } catch (error: any) {
    console.error('Bulk user action error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 