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

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalRevenue = { _sum: { total: 0 } };
    let monthlyRevenue = { _sum: { total: 0 } };
    let totalOrders = 0;
    let monthlyOrders = 0;
    let totalProducts = 0;
    let lowStockProducts = 0;
    let totalUsers = 0;
    let recentOrders = [];
    let topProducts = [];
    let topProductDetails = [];
    let orderStatusDistribution = [];
    let categoryDistribution = [];
    let dailySales = [];
    let totalWishlistItems = 0;
    let totalUsersWithWishlists = 0;
    let topWishlistedProducts = [];
    let topWishlistedProductDetails = [];
    let wishlistActivityByUser = [];
    let wishlistUserActivity = [];

    try {
      totalRevenue = await prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } }
      }) || { _sum: { total: 0 } };
    } catch (e) { console.error('totalRevenue error', e); }
    try {
      monthlyRevenue = await prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' }, createdAt: { gte: thirtyDaysAgo } }
      }) || { _sum: { total: 0 } };
    } catch (e) { console.error('monthlyRevenue error', e); }
    try {
      totalOrders = await prisma.order.count({ where: { status: { not: 'CANCELLED' } } }) || 0;
    } catch (e) { console.error('totalOrders error', e); }
    try {
      monthlyOrders = await prisma.order.count({ where: { status: { not: 'CANCELLED' }, createdAt: { gte: thirtyDaysAgo } } }) || 0;
    } catch (e) { console.error('monthlyOrders error', e); }
    // Fix product counters to only include active, in-stock products
    try {
      totalProducts = await prisma.product.count({ where: { archived: false, inStock: true } }) || 0;
    } catch (e) { console.error('totalProducts error', e); }
    try {
      lowStockProducts = await prisma.product.count({ where: { inStock: false, archived: false } }) || 0;
    } catch (e) { console.error('lowStockProducts error', e); }
    try {
      totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } }) || 0;
    } catch (e) { console.error('totalUsers error', e); }
    try {
      recentOrders = await prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } }
        }
      }) || [];
    } catch (e) { console.error('recentOrders error', e); }
    // For top products, only include non-archived, in-stock products
    try {
      topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }) || [];
      topProductDetails = await Promise.all(
        (topProducts || []).map(async (item) => {
          try {
            const product = await prisma.product.findUnique({
              where: { id: item.productId, archived: false, inStock: true },
              select: { id: true, name: true, price: true, image: true }
            });
            if (!product) return null;
            return {
              ...product,
              totalSold: item._sum?.quantity || 0
            };
          } catch (e) {
            console.error('topProductDetails error', e);
            return null;
          }
        })
      );
      topProductDetails = topProductDetails.filter(Boolean);
    } catch (e) { console.error('topProducts error', e); }
    try {
      orderStatusDistribution = await prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      }) || [];
    } catch (e) { console.error('orderStatusDistribution error', e); }
    // For category distribution, only count categories with at least one active product
    try {
      const categoryDistributionRaw = await prisma.product.groupBy({
        by: ['categoryId'],
        _count: { categoryId: true },
        where: { archived: false, inStock: true }
      }) || [];
      
      // Get category names for each categoryId
      categoryDistribution = await Promise.all(
        categoryDistributionRaw.map(async (item) => {
          if (!item.categoryId) {
            return { category: 'Uncategorized', count: item._count.categoryId };
          }
          
          const category = await prisma.category.findUnique({
            where: { id: item.categoryId },
            select: { name: true }
          });
          
          return {
            category: category?.name || 'Unknown Category',
            count: item._count.categoryId
          };
        })
      );
    } catch (e) { console.error('categoryDistribution error', e); }
    try {
      dailySales = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        let dayRevenue = { _sum: { total: 0 } };
        try {
          dayRevenue = await prisma.order.aggregate({
            _sum: { total: true },
            where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfDay, lt: endOfDay } }
          }) || { _sum: { total: 0 } };
        } catch (e) { console.error('dayRevenue error', e); }
        dailySales.push({ date: startOfDay.toISOString().split('T')[0], revenue: dayRevenue._sum.total || 0 });
      }
    } catch (e) { console.error('dailySales error', e); }
    // For wishlist analytics, only count wishlist items for non-archived, in-stock products
    try {
      totalWishlistItems = await prisma.wishlistItem.count({
        where: {
          product: { archived: false, inStock: true }
        }
      }) || 0;
    } catch (e) { console.error('totalWishlistItems error', e); }
    try {
      totalUsersWithWishlists = await prisma.wishlist.count() || 0;
    } catch (e) { console.error('totalUsersWithWishlists error', e); }
    try {
      topWishlistedProducts = await prisma.wishlistItem.groupBy({
        by: ['productId'],
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5,
        where: {
          product: { archived: false, inStock: true }
        }
      }) || [];
      topWishlistedProductDetails = await Promise.all(
        (topWishlistedProducts || []).map(async (item) => {
          try {
            const product = await prisma.product.findUnique({
              where: { id: item.productId, archived: false, inStock: true },
              select: { id: true, name: true }
            });
            if (!product) return null;
            return {
              productId: item.productId,
              productName: product?.name || 'Unknown Product',
              wishlistCount: item._count?.productId || 0
            };
          } catch (e) {
            console.error('topWishlistedProductDetails error', e);
            return null;
          }
        })
      );
      topWishlistedProductDetails = topWishlistedProductDetails.filter(Boolean);
    } catch (e) { console.error('topWishlistedProducts error', e); }
    try {
      wishlistActivityByUser = await prisma.wishlist.findMany({
        include: { user: { select: { id: true, email: true, name: true } }, items: { orderBy: { addedAt: 'desc' }, take: 1 } },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }) || [];
    } catch (e) { console.error('wishlistActivityByUser error', e); }
    try {
      wishlistUserActivity = (wishlistActivityByUser || []).map((wishlist) => ({
        userId: wishlist.user?.id ?? 0,
        userEmail: wishlist.user?.email ?? 'Unknown',
        userName: wishlist.user?.name ?? 'Unknown',
        wishlistItemCount: wishlist.items?.length ?? 0,
        lastActivity: wishlist.items?.[0]?.addedAt ?? wishlist.updatedAt
      }));
    } catch (e) { console.error('wishlistUserActivity error', e); }

    return NextResponse.json({
      revenue: {
        total: totalRevenue._sum?.total || 0,
        monthly: monthlyRevenue._sum?.total || 0
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
      recentOrders: (recentOrders || []).map((order) => ({
        id: order.id,
        customerName: order.user?.name ?? order.user?.email ?? 'Unknown',
        total: order.total,
        status: order.status,
        date: order.createdAt,
        itemCount: order.items?.length ?? 0
      })),
      topProducts: topProductDetails,
      orderStatusDistribution: (orderStatusDistribution || []).map((item) => ({
        status: item.status ?? 'Unknown',
        count: item._count?.status ?? 0
      })),
      categoryDistribution: (categoryDistribution || []).map((item) => ({
        category: item.category ?? 'Unknown',
        count: item.count ?? 0
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
    return NextResponse.json({ error: 'Failed to fetch analytics', details: error?.message || error }, { status: 500 });
  }
} 