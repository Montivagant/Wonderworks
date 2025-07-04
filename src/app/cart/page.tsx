'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCartItems, isAuthenticated } = useCart();

  const subtotal = cart.total;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to complete your purchase', {
        duration: 4000,
      });
      return;
    }
    // If authenticated, proceed to checkout
    window.location.href = '/checkout';
  };

  // Themed hero section
  const Hero = () => (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white mb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -150 }}
        animate={{ opacity: 0.15, scale: 1, x: 0 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className="absolute -top-32 -left-40 h-[28rem] w-[28rem] rounded-full bg-white blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 150 }}
        animate={{ opacity: 0.1, scale: 1, y: 0 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white blur-3xl"
      />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-md"
        >
          Your Shopping Cart
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-6 max-w-2xl text-xl sm:text-2xl text-white/90"
        >
          Review your selected items and proceed to checkout when you&rsquo;re ready!
        </motion.p>
      </div>
    </section>
  );

  if ((cart.items || []).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white py-8">
        <Hero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="text-8xl mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                y: [0, -5, 0]
              }}
              transition={{ 
                delay: 0.2, 
                type: "spring", 
                stiffness: 200,
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              🛒
            </motion.div>
            <motion.h1 
              className="text-4xl font-bold text-orange-600 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Your cart is empty
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Looks like you haven&rsquo;t added any products to your cart yet. Start shopping to discover amazing products!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link 
                href="/products"
                className="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Shopping
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white py-8">
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 
          className="text-4xl font-bold text-orange-600 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Shopping Cart
        </motion.h1>

        {/* Notice for unauthenticated users */}
        {!isAuthenticated && (
          <motion.div 
            className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl border border-orange-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start">
              <svg className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-orange-900 mb-1">Guest Shopping</h3>
                <p className="text-sm text-orange-800">
                  Your cart items are saved locally. When you log in or create an account, your items will be automatically transferred to your account so you can track your orders.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-orange-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="p-6 border-b border-orange-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-orange-700">
                  Cart Items ({(cart.items || []).length})
                </h2>
                <motion.button
                  onClick={clearCartItems}
                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Cart
                </motion.button>
              </div>
              <div className="divide-y divide-orange-100">
                <AnimatePresence>
                  {(cart.items || []).map((item, index) => (
                    <motion.div 
                      key={item.id} 
                      className="p-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                            <span className="text-orange-400 text-sm font-medium">Image</span>
                          </div>
                        </div>
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-orange-900">{item.name}</h3>
                          <p className="text-orange-700">{item.price.toFixed(2)} <span className="text-base font-normal text-orange-500">EGP</span> each</p>
                          {!item.inStock && (
                            <div className="text-red-600 text-sm font-medium flex items-center mt-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              Out of Stock
                            </div>
                          )}
                        </div>
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-orange-300 flex items-center justify-center hover:bg-orange-50 transition-colors text-orange-700 font-medium"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            -
                          </motion.button>
                          <span className="w-12 text-center font-medium text-orange-900">{item.quantity}</span>
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-orange-300 flex items-center justify-center hover:bg-orange-50 transition-colors text-orange-700 font-medium"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            +
                          </motion.button>
                        </div>
                        {/* Remove Button */}
                        <motion.button
                          onClick={() => removeItem(item.id)}
                          className="ml-4 text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Remove
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
          {/* Cart Summary */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-orange-700 mb-2">Order Summary</h2>
            <div className="flex justify-between text-orange-900">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between text-orange-900">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `${shipping.toFixed(2)} EGP`}</span>
            </div>
            <div className="flex justify-between text-orange-900">
              <span>Tax (8%)</span>
              <span>{tax.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between font-bold text-orange-900 text-lg">
              <span>Total</span>
              <span>{total.toFixed(2)} EGP</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:from-orange-600 hover:to-amber-600"
            >
              Proceed to Checkout
            </button>
            <Link href="/products" className="w-full text-center text-orange-600 hover:underline text-sm mt-2">
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 