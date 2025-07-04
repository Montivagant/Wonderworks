import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// Helper: ensure user is authenticated and return user id
async function getUserId(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.id ?? null;
}

// Helper: fetch (or create) the wishlist for a user
async function getOrCreateWishlist(userId: number) {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              category: true,
              rating: true,
              inStock: true
            }
          }
        }
      }
    }
  });
  
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                category: true,
                rating: true,
                inStock: true
              }
            }
          }
        }
      }
    });
  }
  
  return wishlist;
}

// GET /api/wishlist – get current user's wishlist
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlist = await getOrCreateWishlist(userId);
    
    const items = wishlist.items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      category: item.product.category,
      rating: item.product.rating,
      inStock: item.product.inStock,
      addedAt: item.addedAt
    }));

    return NextResponse.json({
      success: true,
      items,
      itemCount: items.length
    });
  } catch (error) {
    console.error('[GET /api/wishlist]', error);
    return NextResponse.json({ error: 'Failed to get wishlist' }, { status: 500 });
  }
}

// POST /api/wishlist – add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const wishlist = await getOrCreateWishlist(userId);

    // Check if item already exists in wishlist
    const existingItem = wishlist.items.find(item => item.productId === productId);
    if (existingItem) {
      return NextResponse.json({ error: 'Item already in wishlist' }, { status: 400 });
    }

    // Add item to wishlist
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Item added to wishlist' 
    });
  } catch (error) {
    console.error('[POST /api/wishlist]', error);
    return NextResponse.json({ error: 'Failed to add item to wishlist' }, { status: 500 });
  }
}

// DELETE /api/wishlist – remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    // Remove item from wishlist
    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from wishlist' 
    });
  } catch (error) {
    console.error('[DELETE /api/wishlist]', error);
    return NextResponse.json({ error: 'Failed to remove item from wishlist' }, { status: 500 });
  }
} 