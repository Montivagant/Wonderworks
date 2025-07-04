import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation } from '@/lib/email';
import { Prisma } from '@prisma/client';

// Define proper types for database entities
interface CartItemWithProduct {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

interface CartWithItems {
  id: number;
  userId: number;
  items: CartItemWithProduct[];
}

interface OrderItemWithProduct {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

interface OrderWithItems {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: Date;
  items: OrderItemWithProduct[];
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
}

// TODO: remove any casting once Prisma client is regenerated with Order models
const db: typeof prisma = prisma;

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
}

// GET /api/orders – list current user's orders
export async function GET() {
  const user = await getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(orders);
}

// POST /api/orders – create order from current cart { address?, paymentMethod? }
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const cart = await db.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  }) as CartWithItems | null;
  
  if (!cart || cart.items.length === 0) {
    return new NextResponse('Cart is empty', { status: 400 });
  }

  // Capture address and paymentMethod if provided
  const { address, paymentMethod } = (await req.json().catch(() => ({}))) as { address?: string, paymentMethod?: string };
  const paymentMethodValue = paymentMethod === 'COD' ? 'COD' : 'CREDIT_CARD';

  // Calculate total
  const total = cart.items.reduce((sum: number, item: CartItemWithProduct) => sum + item.product.price * item.quantity, 0);

  try {
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          total,
          status: 'PENDING',
          paymentMethod: paymentMethodValue,
        },
      });

      // create order items
      await Promise.all(
        cart.items.map((ci: CartItemWithProduct) =>
          tx.orderItem.create({
            data: {
              orderId: createdOrder.id,
              productId: ci.productId,
              quantity: ci.quantity,
              price: ci.product.price,
            },
          })
        )
      );

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrder;
    });

    // Send order confirmation email
    try {
      const orderWithItems = await prisma.order.findUnique({
        where: { id: order.id },
        include: { 
          items: { 
            include: { product: true } 
          },
          user: true 
        },
      }) as OrderWithItems | null;

      if (orderWithItems && orderWithItems.user) {
        await sendOrderConfirmation({
          orderId: order.id,
          customerName: orderWithItems.user.name || 'Customer',
          customerEmail: orderWithItems.user.email,
          orderTotal: orderWithItems.total,
          orderItems: orderWithItems.items.map((item: OrderItemWithProduct) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: address || 'Address not provided',
          orderStatus: orderWithItems.status,
        });
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({ id: order.id });
  } catch (err) {
    console.error('[POST /api/orders]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
} 