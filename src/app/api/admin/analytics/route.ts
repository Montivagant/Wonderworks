import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/admin/analytics - get comprehensive analytics data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get current date and date 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total revenue
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } }
    });

    // Monthly revenue (last 30 days)
    const monthlyRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    // Total orders
    const totalOrders = await prisma.order.count({
      where: { status: { not: 'CANCELLED' } }
    });

    // Monthly orders (last 30 days)
    const monthlyOrders = await prisma.order.count({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    // Total products
    const totalProducts = await prisma.product.count();

    // Low stock products (out of stock)
    const lowStockProducts = await prisma.product.count({
      where: { inStock: false }
    });

    // Total users
    const totalUsers = await prisma.user.count({
      where: { role: 'CUSTOMER' }
    });

    // Recent orders (last 10)
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
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

    // Top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // Get product details for top sellers
    const topProductDetails = await Promise.all(
      topProducts.map(async (item: { productId: number, _sum: { quantity: number | null } }) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, price: true, image: true }
        });
        return {
          ...product,
          totalSold: item._sum.quantity || 0
        };
      })
    );

    // Order status distribution
    const orderStatusDistribution = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    // Category distribution
    const categoryDistribution = await prisma.product.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    // Daily sales for the last 7 days
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const dayRevenue = await prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { not: 'CANCELLED' },
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      });

      dailySales.push({
        date: startOfDay.toISOString().split('T')[0],
        revenue: dayRevenue._sum.total || 0
      });
    }

    // Wishlist Analytics
    const totalWishlistItems = await prisma.wishlistItem.count();
    
    const totalUsersWithWishlists = await prisma.wishlist.count();
    
    // Top wishlisted products
    const topWishlistedProducts = await prisma.wishlistItem.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: {
        _count: {
          productId: 'desc'
        }
      },
      take: 5
    });

    const topWishlistedProductDetails = await Promise.all(
      topWishlistedProducts.map(async (item: { productId: number, _count: { productId: number } }) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true }
        });
        return {
          productId: item.productId,
          productName: product?.name || 'Unknown Product',
          wishlistCount: item._count.productId
        };
      })
    );

    // Wishlist activity by user
    const wishlistActivityByUser = await prisma.wishlist.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true }
        },
        items: {
          orderBy: { addedAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    });

    const wishlistUserActivity = wishlistActivityByUser.map((wishlist: {
      user: { id: number; email: string; name: string | null };
      items: { addedAt: Date }[];
      updatedAt: Date;
    }) => ({
      userId: wishlist.user.id,
      userEmail: wishlist.user.email,
      userName: wishlist.user.name,
      wishlistItemCount: wishlist.items.length,
      lastActivity: wishlist.items[0]?.addedAt || wishlist.updatedAt
    }));

    return NextResponse.json({
      revenue: {
        total: totalRevenue._sum.total || 0,
        monthly: monthlyRevenue._sum.total || 0
      },
      orders: {
        total: totalOrders,
        monthly: monthlyOrders
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      },
      users: {
        total: totalUsers
      },
      recentOrders: recentOrders.map((order: {
        id: number;
        user?: { name?: string | null; email?: string | null } | null;
        total: number;
        status: string;
        createdAt: Date;
        items: any[];
      }) => ({
        id: order.id,
        customerName: order.user?.name || order.user?.email || 'Unknown',
        total: order.total,
        status: order.status,
        date: order.createdAt,
        itemCount: order.items.length
      })),
      topProducts: topProductDetails,
      orderStatusDistribution: orderStatusDistribution.map((item: { status: string; _count: { status: number } }) => ({
        status: item.status,
        count: item._count.status
      })),
      categoryDistribution: categoryDistribution.map((item: { category: string; _count: { category: number } }) => ({
        category: item.category,
        count: item._count.category
      })),
      dailySales,
      wishlistAnalytics: {
        totalWishlistItems,
        totalUsersWithWishlists,
        topWishlistedProducts: topWishlistedProductDetails,
        wishlistActivityByUser: wishlistUserActivity
      }
    });
  } catch (error) {
    console.error('[GET /api/admin/analytics]', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
} 