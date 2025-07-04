'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Clock, 
  Package, 
  Check, 
  X, 
  ArrowLeft,
  MapPin,
  Calendar,
  CreditCard
} from 'lucide-react';
import Image from 'next/image';
import type { Order } from '@/types';

// Define proper types for order items
interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (session === null) {
      router.replace('/login');
    } else {
      setLoading(false);
    }
  }, [session, router]);

  // Fetch order details
  const { data: orderData, error: swrError } = useSWR(
    session ? `/api/orders/${params.id}` : null,
    fetcher
  );

  useEffect(() => {
    if (swrError) {
      setError(swrError.message);
    } else if (orderData) {
      setOrder(orderData);
    }
  }, [swrError, orderData]);

  // Helper to format date
  const formatDate = (dateString?: string) => {
    const date = new Date(dateString || '');
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
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
          color: 'bg-yellow-100 text-yellow-800',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'processing':
        return { 
          icon: <Package className="w-5 h-5" />, 
          color: 'bg-blue-100 text-blue-800',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'shipped':
        return { 
          icon: <ShoppingBag className="w-5 h-5" />, 
          color: 'bg-purple-100 text-purple-800',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      case 'delivered':
        return { 
          icon: <Check className="w-5 h-5" />, 
          color: 'bg-green-100 text-green-800',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'cancelled':
        return { 
          icon: <X className="w-5 h-5" />, 
          color: 'bg-red-100 text-red-800',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return { 
          icon: <Clock className="w-5 h-5" />, 
          color: 'bg-gray-100 text-gray-800',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-700">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Order</h2>
            <p className="text-xl text-gray-600 mb-8">
              We couldn&apos;t load the order details. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-yellow-700 mb-2">Order Not Found</h2>
            <p className="text-yellow-600 mb-4">The order you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/orders"
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { icon, color, bgColor, borderColor } = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/orders"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Order Header */}
          <div className={`bg-white rounded-xl shadow-sm border ${borderColor} overflow-hidden`}>
            <div className={`${bgColor} px-6 py-4 border-b ${borderColor}`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${color}`}>
                    {icon}
                    <span className="ml-2 capitalize">{order.status}</span>
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {order.total.toFixed(2)} EGP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.items.map((item: OrderItem, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 flex items-center"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Image
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Price: {item.price.toFixed(2)} EGP each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {(item.quantity * item.price).toFixed(2)} EGP
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Payment Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">Credit Card</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className="font-medium text-green-600">Paid</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-bold text-lg">{order.total.toFixed(2)} EGP</span>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 block">Shipping Address</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {order.shippingAddress || 'Address not provided'}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Method</span>
                    <span className="font-medium">Standard Delivery</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Delivery</span>
                    <span className="font-medium">3-5 business days</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{(order.total / 1.08).toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span>{(order.total * 0.08).toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{order.total.toFixed(2)} EGP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 