import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
}

// GET /api/orders/[id] – get specific order details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    return new NextResponse('Invalid order ID', { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId, 
        userId: user.id 
      },
      include: { 
        items: { 
          include: { product: true } 
        } 
      },
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('[GET /api/orders/[id]]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 