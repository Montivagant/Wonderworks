import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { CartItem } from '@/types';

// Define proper types for database entities
interface CartItemWithProduct {
  id: number;
  productId: number;
  quantity: number;
  price?: number;
  product?: {
    id: number;
    name: string;
    price: number;
    image?: string;
    inStock?: boolean;
  };
}

interface CartWithItems {
  id: number;
  userId: number;
  items: CartItemWithProduct[];
}

// TODO: remove any casting once Prisma client is regenerated with Cart models
const db: typeof prisma = prisma;

// Helper: ensure user is authenticated and return user id
async function getUserId(): Promise<number | null> {
  console.log('🛒 [Cart API] getUserId called');
  const session = await getServerSession(authOptions);
  console.log('🛒 [Cart API] Session:', session);
  
  if (!session || !session.user || !session.user.email) {
    console.log('🛒 [Cart API] No session or user email found');
    return null;
  }
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  console.log('🛒 [Cart API] User found:', user ? { id: user.id, email: user.email } : null);
  return user?.id ?? null;
}

// Helper: fetch (or create) the cart for a user
async function getOrCreateCart(userId: number): Promise<CartWithItems> {
  console.log('🛒 [Cart API] getOrCreateCart called for userId:', userId);
  
  let cart = await db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  }) as CartWithItems | null;
  
  console.log('🛒 [Cart API] Existing cart found:', cart ? { id: cart.id, itemCount: cart.items.length } : null);
  
  if (!cart) {
    console.log('🛒 [Cart API] Creating new cart for user');
    cart = await db.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    }) as CartWithItems;
    console.log('🛒 [Cart API] New cart created:', { id: cart.id });
  }
  
  return cart;
}

const cartToResponse = (cart: CartWithItems | null): CartResponse => {
  if (!cart) {
    return {
      success: false,
      message: 'Cart not found'
    };
  }

  const items = cart.items || [];
  const total = items.reduce((sum: number, item: CartItemWithProduct) => {
    const unit = item.price ?? item.product?.price ?? 0;
    return sum + unit * item.quantity;
  }, 0);
  const itemCount = items.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0);

  return {
    success: true,
    message: 'Cart retrieved successfully',
    cart: {
      items: items.map((item: CartItemWithProduct) => ({
        productId: item.productId,
        id: item.productId,
        name: item.product?.name || 'Unknown Product',
        price: item.price ?? item.product?.price ?? 0,
        image: item.product?.image,
        quantity: item.quantity,
        inStock: item.product?.inStock || false
      })),
      total,
      itemCount
    }
  };
};

// GET /api/cart – get current user's cart
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await getOrCreateCart(userId);
    console.log('🛒 [Cart API] GET - Cart retrieved for userId:', userId);
    return NextResponse.json(cartToResponse(cart));
  } catch (error) {
    console.error('🛒 [Cart API] GET - Error:', error);
    return NextResponse.json({ error: 'Failed to get cart' }, { status: 500 });
  }
}

// POST /api/cart – add item to cart
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CartRequest = await request.json();
    const { productId, quantity } = body;

    if (!productId || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid product or quantity' }, { status: 400 });
    }

    const cart = await getOrCreateCart(userId);
    console.log('🛒 [Cart API] POST - Adding item to cart for userId', userId, { productId, quantity });

    // Check if item already exists in cart
    const existingItem = cart.items.find((item: CartItemWithProduct) => item.productId === productId);

    if (existingItem) {
      // Update quantity
      const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: {
            update: {
              where: { id: existingItem.id },
              data: { quantity: existingItem.quantity + quantity }
            }
          }
        },
        include: { items: { include: { product: true } } }
      }) as CartWithItems;
      console.log('🛒 [Cart API] POST - Item quantity updated');
      return NextResponse.json(cartToResponse(updatedCart));
    } else {
      // Add new item
      const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: {
            create: {
              productId,
              quantity
            }
          }
        },
        include: { items: { include: { product: true } } }
      }) as CartWithItems;
      console.log('🛒 [Cart API] POST - New item added to cart');
      return NextResponse.json(cartToResponse(updatedCart));
    }
  } catch (error) {
    console.error('🛒 [Cart API] POST - Error:', error);
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}

// PUT /api/cart – update item quantity { productId, quantity }
export async function PUT(request: Request) {
  console.log('🛒 [Cart API] PUT /api/cart called');
  const userId = await getUserId();
  if (!userId) {
    console.log('🛒 [Cart API] Unauthorized - no userId');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  const { productId: rawId, quantity } = await request.json();
  const productId = Number(rawId);
  
  console.log('🛒 [Cart API] Updating quantity:', { productId, quantity });
  
  if (!productId || Number.isNaN(productId) || typeof quantity !== 'number') {
    console.log('🛒 [Cart API] Invalid payload:', { productId, quantity });
    return new NextResponse('Invalid payload', { status: 400 });
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((it: CartItemWithProduct) => it.productId === productId);
  if (!item) {
    console.log('🛒 [Cart API] Item not found in cart:', productId);
    return new NextResponse('Item not found', { status: 404 });
  }

  if (quantity <= 0) {
    console.log('🛒 [Cart API] Removing item (quantity <= 0)');
    await db.cartItem.delete({ where: { id: item.id } });
  } else {
    console.log('🛒 [Cart API] Updating item quantity');
    await db.cartItem.update({ where: { id: item.id }, data: { quantity } });
  }
  
  const updated = await getOrCreateCart(userId);
  console.log('🛒 [Cart API] Cart updated successfully');
  return NextResponse.json(cartToResponse(updated));
}

// DELETE /api/cart – remove a single product or clear all
// payload optional { productId? }
export async function DELETE(request: Request) {
  console.log('🛒 [Cart API] DELETE /api/cart called');
  const userId = await getUserId();
  if (!userId) {
    console.log('🛒 [Cart API] Unauthorized - no userId');
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  let productId: number | undefined;
  try {
    const body = await request.json();
    if (body?.productId !== undefined) productId = Number(body.productId);
  } catch {
    // no body → treat as clear cart
  }
  
  console.log('🛒 [Cart API] Delete operation:', productId ? `remove item ${productId}` : 'clear cart');

  const cart = await getOrCreateCart(userId);

  if (productId) {
    const item = cart.items.find((i: CartItemWithProduct) => i.productId === productId);
    if (item) {
      console.log('🛒 [Cart API] Removing specific item');
      await db.cartItem.delete({ where: { id: item.id } });
    }
  } else {
    console.log('🛒 [Cart API] Clearing all items');
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  const updated = await getOrCreateCart(userId);
  console.log('🛒 [Cart API] Cart updated successfully');
  return NextResponse.json(cartToResponse(updated));
}

interface CartRequest {
  productId: number;
  quantity: number;
}

interface CartResponse {
  success: boolean;
  message: string;
  cart?: {
    items: CartItem[];
    total: number;
    itemCount: number;
  };
} 