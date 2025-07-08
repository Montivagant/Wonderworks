import { rest } from 'msw';

export const handlers = [
  // Products API
  rest.get('/api/products', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([
      { id: 1, name: 'Mock Product', price: 10, category: 'decor', inStock: true, rating: 5 }
    ]));
  }),
  rest.post('/api/products', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),
  rest.delete('/api/products/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),
  rest.post('/api/products/reset', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([
      { id: 1, name: 'Default', price: 1, category: 'decor', inStock: true, rating: 5 }
    ]));
  }),
  // Analytics API
  rest.get('/api/admin/analytics', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({
      revenue: { total: 1000, monthly: 100 },
      orders: { total: 10, monthly: 2 },
      products: { total: 1, lowStock: 0 },
      users: { total: 1 },
      recentOrders: [],
      topProducts: [],
      orderStatusDistribution: [],
      categoryDistribution: [],
      dailySales: [],
      wishlistAnalytics: { totalWishlistItems: 0, totalUsersWithWishlists: 0, topWishlistedProducts: [], wishlistActivityByUser: [] }
    }));
  }),
]; 