import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusUpdate } from '@/lib/email';

// GET /api/admin/orders - get all orders for admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: { status?: string } = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where: where as any,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { name: true, price: true }
            }
          }
        }
      }
    });

    // Get total count for pagination
    const total = await prisma.order.count({ where: where as any });

    return NextResponse.json({
      orders: orders.map((order: {
        id: number;
        user?: { name?: string | null; email?: string | null } | null;
        total: number;
        status: string;
        createdAt: Date;
        items: { id: number; product: { name: string; price: number }; quantity: number; price: number }[];
      }) => ({
        id: order.id,
        customerName: order.user?.name || order.user?.email || 'Unknown',
        customerEmail: order.user?.email,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price
        }))
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[GET /api/admin/orders]', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// PUT /api/admin/orders/[id]/status - update order status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status required' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      }
    });

    // Send email notification if status changed
    if (updatedOrder.user?.email) {
      try {
        await sendOrderStatusUpdate({
          orderId: updatedOrder.id,
          customerName: updatedOrder.user.name || 'Customer',
          customerEmail: updatedOrder.user.email,
          orderTotal: updatedOrder.total,
          orderItems: updatedOrder.items.map((item: { product: { name: string }; quantity: number; price: number }) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress: 'Address not provided',
          orderStatus: status
        });
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[PUT /api/admin/orders]', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
} 