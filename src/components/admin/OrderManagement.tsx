'use client';

import { useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
  Package
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface OrderResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function OrderManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: orderData, mutate } = useSWR<OrderResponse>(`/api/admin/orders?page=${currentPage}&limit=10`, fetcher);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        mutate();
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'primary';
      case 'SHIPPED':
        return 'success';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-3 h-3" />;
      case 'PROCESSING':
        return <Package className="w-3 h-3" />;
      case 'SHIPPED':
        return <Truck className="w-3 h-3" />;
      case 'DELIVERED':
        return <CheckCircle className="w-3 h-3" />;
      case 'CANCELLED':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!orderData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Order Management</h1>
          <p className="text-neutral-600 mt-1">Track and manage customer orders</p>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Orders ({orderData.orders.length})</h2>
            <Badge variant="primary">{orderData.pagination.total} total</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                <AnimatePresence>
                  {orderData.orders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-neutral-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {order.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={getStatusColor(order.status) as any} 
                          size="sm"
                          className="flex items-center"
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={isUpdating}
                            className="text-sm border border-neutral-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {orderData && orderData.pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-neutral-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(orderData.pagination.pages, currentPage + 1))}
                  disabled={currentPage === orderData.pagination.pages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-700">
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * orderData.pagination.limit + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * orderData.pagination.limit, orderData.pagination.total)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{orderData.pagination.total}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded-l-md"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    
                    {Array.from({ length: Math.min(5, orderData.pagination.pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="rounded-none"
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(orderData.pagination.pages, currentPage + 1))}
                      disabled={currentPage === orderData.pagination.pages}
                      className="rounded-r-md"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setSelectedOrder(null)}
          >
            <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Order #{selectedOrder.id} Details
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Customer Information</h4>
                  <div className="bg-white p-4 rounded-lg">
                    <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Order Information</h4>
                  <div className="bg-white p-4 rounded-lg space-y-2">
                    <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
                    <p><strong>Status:</strong> 
                      <Badge 
                        variant={getStatusColor(selectedOrder.status) as any} 
                        size="sm"
                        className="ml-2 flex items-center"
                      >
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-1">{selectedOrder.status}</span>
                      </Badge>
                    </p>
                    <p><strong>Created:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p><strong>Updated:</strong> {formatDate(selectedOrder.updatedAt)}</p>
                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-2">Order Items</h4>
                  <div className="bg-white rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-neutral-900">{item.productName}</td>
                            <td className="px-4 py-3 text-sm text-neutral-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-neutral-900">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                              {formatCurrency(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 