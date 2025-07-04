'use client';

import { motion } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Eye, 
  Sparkles, 
  CheckCircle, 
  XCircle,
  Star,
  Package,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';
import { getImageWithFallback } from '@/utils/imageUtils';
import { WishlistItem } from '@/types';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign in to view your wishlist</h2>
            <p className="text-lg text-gray-600 mb-8">
              Create an account or sign in to save your favorite items and never lose track of what you love
            </p>
            <Link 
              href="/login"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (wishlist.itemCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-lg text-gray-600 mb-8">
              Start adding items you love to your wishlist and keep track of your favorite products
            </p>
            <Link 
              href="/products"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      await addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        rating: item.rating,
        inStock: item.inStock,
      });
      toast.success(`${item.name} added to cart!`);
    } catch {
      toast.error('Failed to add item to cart');
    }
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
      toast.success('Item removed from wishlist');
    } catch {
      toast.error('Failed to remove item from wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-6">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            My Wishlist
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {wishlist.itemCount} {wishlist.itemCount === 1 ? 'item' : 'items'} in your wishlist • Keep track of your favorite products
          </p>
        </motion.div>

        {/* Wishlist Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{wishlist.itemCount}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {wishlist.items.filter(item => item.inStock).length}
              </p>
              <p className="text-sm text-gray-600">In Stock</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {wishlist.items.reduce((total, item) => total + item.price, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total Value (EGP)</p>
            </div>
          </div>
        </motion.div>

        {/* Wishlist Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {wishlist.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
            >
              {/* Product Image */}
              <Link href={`/product/${item.id}`}>
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={getImageWithFallback(item.image)}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-full p-3 shadow-lg"
                    >
                      <Eye className="w-5 h-5 text-gray-700" />
                    </motion.div>
                  </div>
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-6">
                {/* Category */}
                <p className="text-sm text-orange-600 font-semibold mb-2 flex items-center">
                  <Package className="w-3 h-3 mr-1" />
                  {item.category}
                </p>
                
                {/* Product Name */}
                <Link href={`/product/${item.id}`}>
                  <h3 className="font-bold text-gray-900 mb-3 hover:text-orange-600 transition-colors line-clamp-2 text-lg">
                    {item.name}
                  </h3>
                </Link>

                {/* Price and Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xl font-bold text-gray-900">
                      {item.price.toFixed(2)} <span className="text-orange-600">EGP</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(item.rating) 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1 font-medium">({item.rating})</span>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  {item.inStock ? (
                    <div className="flex items-center text-emerald-600 text-sm font-semibold bg-emerald-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      In Stock
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 text-sm font-semibold bg-red-50 px-3 py-2 rounded-lg">
                      <XCircle className="w-4 h-4 mr-2" />
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.inStock}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-4 rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-semibold shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="bg-red-50 text-red-600 py-3 px-4 rounded-xl hover:bg-red-100 transition-all duration-200 border border-red-200 hover:border-red-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Quick View Link */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/product/${item.id}`}
                    className="text-orange-600 hover:text-orange-700 font-semibold text-sm inline-flex items-center transition-colors duration-200"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State (if all items are removed) */}
        {wishlist.itemCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding items you love to your wishlist and keep track of your favorite products
            </p>
            <Link
              href="/products"
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Browse Products
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
} 