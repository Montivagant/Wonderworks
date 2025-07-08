'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  AlertTriangle,
  BarChart3,
  Calendar,
  Star,
  Heart,
  User
} from 'lucide-react';
import useSWR from 'swr';
import ProgressBar from '@/components/ui/ProgressBar';
import VerticalBar from '@/components/ui/VerticalBar';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) {
    throw new Error(`HTTP error! status: ${r.status}`);
  }
  return r.json();
});

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
  };
  orders: {
    total: number;
    monthly: number;
  };
  products: {
    total: number;
    lowStock: number;
  };
  users: {
    total: number;
  };
  recentOrders: Array<{
    id: number;
    customerName: string;
    total: number;
    status: string;
    date: string;
    itemCount: number;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    price: number;
    image?: string;
    totalSold: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  dailySales: Array<{
    date: string;
    revenue: number;
  }>;
  wishlistAnalytics: {
    totalWishlistItems: number;
    totalUsersWithWishlists: number;
    topWishlistedProducts: Array<{
      productId: number;
      productName: string;
      wishlistCount: number;
    }>;
    wishlistActivityByUser: Array<{
      userId: number;
      userEmail: string;
      userName?: string;
      wishlistItemCount: number;
      lastActivity: string;
    }>;
  };
}

export default function AnalyticsDashboard() {
  const { data: analytics, error } = useSWR<AnalyticsData>('/api/admin/analytics', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    onError: (err) => {
      console.error('Analytics fetch error:', err);
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (analytics || error) {
      setIsLoading(false);
    }
  }, [analytics, error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-error-500 mx-auto mb-4" />
        <p className="text-neutral-700 mb-2">Failed to load analytics data</p>
        <p className="text-sm text-neutral-500">
          {error.message === 'HTTP error! status: 401' 
            ? 'Please log in as an admin user to view analytics.'
            : error.message}
        </p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-700">No analytics data available</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-warning-100 text-warning-800';
      case 'PROCESSING': return 'bg-primary-100 text-primary-800';
      case 'SHIPPED': return 'bg-neutral-100 text-neutral-800';
      case 'DELIVERED': return 'bg-success-100 text-success-800';
      case 'CANCELLED': return 'bg-error-100 text-error-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="w-8 h-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-700">Total Revenue</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {formatCurrency(analytics.revenue.total)}
              </p>
              <p className="text-sm text-neutral-500">
                {formatCurrency(analytics.revenue.monthly)} this month
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCart className="w-8 h-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-700">Total Orders</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {analytics.orders.total}
              </p>
              <p className="text-sm text-neutral-500">
                {analytics.orders.monthly} this month
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="w-8 h-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-700">Products</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {analytics.products.total}
              </p>
              <p className="text-sm text-error-500">
                {analytics.products.lowStock} out of stock
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-neutral-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-700">Customers</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {analytics.users.total}
              </p>
              <p className="text-sm text-neutral-500">
                Registered users
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Heart className="w-8 h-8 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-700">Wishlist Items</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {analytics.wishlistAnalytics.totalWishlistItems}
              </p>
              <p className="text-sm text-neutral-500">
                {analytics.wishlistAnalytics.totalUsersWithWishlists} users
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts and Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Orders
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div>
                    <p className="font-medium text-neutral-900">#{order.id}</p>
                    <p className="text-sm text-neutral-700">{order.customerName}</p>
                    <p className="text-xs text-neutral-500">{formatDate(order.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">{formatCurrency(order.total)}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Top Selling Products
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-neutral-400 mr-3">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-neutral-900">{product.name}</p>
                      <p className="text-sm text-neutral-700">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">{product.totalSold} sold</p>
                    <p className="text-sm text-neutral-700">
                      {formatCurrency(product.price * product.totalSold)} revenue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Wishlist Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Wishlisted Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Top Wishlisted Products
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.wishlistAnalytics.topWishlistedProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-neutral-400 mr-3">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-neutral-900">{product.productName}</p>
                      <p className="text-sm text-neutral-700">Product ID: {product.productId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">{product.wishlistCount} users</p>
                    <p className="text-sm text-error-600">Added to wishlist</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Wishlist Activity by User */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Wishlist Activity by User
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.wishlistAnalytics.wishlistActivityByUser.map((user) => (
                <div key={user.userId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div>
                    <p className="font-medium text-neutral-900">{user.userName || user.userEmail}</p>
                    <p className="text-sm text-neutral-700">{user.userEmail}</p>
                    <p className="text-xs text-neutral-500">
                      Last activity: {formatDate(user.lastActivity)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">{user.wishlistItemCount} items</p>
                    <p className="text-sm text-error-600">In wishlist</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Order Status Distribution
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analytics.orderStatusDistribution.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">{item.status}</span>
                  <div className="flex items-center">
                    <ProgressBar
                      percentage={(item.count / analytics.orders.total) * 100}
                      color="primary"
                      className="w-32"
                    />
                    <span className="text-sm text-neutral-700 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
        >
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Product Categories
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analytics.categoryDistribution.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">{item.category}</span>
                  <div className="flex items-center">
                    <ProgressBar
                      percentage={(item.count / analytics.products.total) * 100}
                      color="success"
                      className="w-32"
                    />
                    <span className="text-sm text-neutral-700 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Daily Sales Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
      >
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Daily Sales (Last 7 Days)
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-end justify-between h-32">
            {analytics.dailySales.map((day) => {
              const maxRevenue = Math.max(...analytics.dailySales.map(d => d.revenue));
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={day.date} className="flex flex-col items-center">
                  <div className="text-xs text-neutral-700 mb-2">
                    {formatCurrency(day.revenue)}
                  </div>
                  <VerticalBar
                    percentage={height}
                    className="w-8 bg-primary-600 rounded-t"
                  />
                  <div className="text-xs text-neutral-500 mt-2">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 