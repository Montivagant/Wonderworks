'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Clock, 
  Package, 
  Check, 
  X, 
  ChevronRight, 
  Sparkles, 
  Calendar,
  DollarSign,
  Truck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// Define proper types for order data
interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (session === null) {
      router.replace('/login');
    } else {
      setLoading(false);
    }
  }, [session, router]);

  // Fetch orders
  const { data: orders = [], error: swrError } = useSWR<Order[]>(
    session ? '/api/orders' : null,
    fetcher
  );

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Helper to get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { 
          icon: <Clock className="w-5 h-5" />, 
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700'
        };
      case 'processing':
        return { 
          icon: <Package className="w-5 h-5" />, 
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700'
        };
      case 'shipped':
        return { 
          icon: <Truck className="w-5 h-5" />, 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700'
        };
      case 'delivered':
        return { 
          icon: <Check className="w-5 h-5" />, 
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700'
        };
      case 'cancelled':
        return { 
          icon: <X className="w-5 h-5" />, 
          color: 'bg-red-100 text-red-800 border-red-200',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700'
        };
      default:
        return { 
          icon: <Clock className="w-5 h-5" />, 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (swrError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Orders</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              We couldn&apos;t load your orders. Please try again or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5 inline mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-6">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            My Orders
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your orders and stay updated on their delivery status
          </p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              You haven&apos;t placed any orders yet. Start shopping to discover amazing products!
            </p>
            <Link
              href="/products"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {orders.map((order: Order, index: number) => {
              const { icon, color, bgColor } = getStatusInfo(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  {/* Order Header */}
                  <div className={`${bgColor} px-6 py-6 border-b border-gray-100`}>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">#{order.id}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Placed on {formatDate(order.createdAt)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center border ${color}`}>
                          {icon}
                          <span className="ml-2 capitalize">{order.status}</span>
                        </span>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 font-medium">Total</p>
                          <p className="text-xl font-bold text-gray-900 flex items-center">
                            <DollarSign className="w-5 h-5 text-orange-500 mr-1" />
                            {order.total.toFixed(2)} <span className="text-orange-600 ml-1">EGP</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-gray-100">
                    {order.items.map((item: OrderItem, itemIndex: number) => (
                      <motion.div 
                        key={item.id} 
                        className="p-6 flex items-center hover:bg-gray-50 transition-colors duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index * 0.1) + (itemIndex * 0.05) }}
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                          <Package className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg">{item.product.name}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium mr-2">
                              Qty: {item.quantity}
                            </span>
                            {item.price.toFixed(2)} EGP each
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-lg">
                            {(item.quantity * item.price).toFixed(2)} <span className="text-orange-600">EGP</span>
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className={`${bgColor} px-6 py-4 border-t border-gray-100 flex justify-between items-center`}>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600 font-medium">
                        Order #{order.id}
                      </span>
                      <span className="text-sm text-gray-500">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {order.total.toFixed(2)} EGP
                      </span>
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-orange-600 hover:text-orange-700 font-semibold text-sm inline-flex items-center bg-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
} 