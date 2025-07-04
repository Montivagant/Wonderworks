'use client';
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Eye, 
  ShoppingCart,
  CheckCircle,
  XCircle,
  Heart
} from 'lucide-react';
import { getImageWithFallback, sanitizeImageUrl, debugImage } from '@/utils/imageUtils';
import { Product } from '@/types';
import { useWishlist } from '@/contexts/WishlistContext';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => Promise<void>;
  priority?: boolean;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, onAddToCart, priority = false, viewMode = 'grid' }: ProductCardProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState<string>('/placeholder.svg');
  const { addToWishlist, removeFromWishlist, isInWishlist, isAuthenticated } = useWishlist();
  
  // NEW: helper to detect data URLs
  const isDataUrl = React.useCallback((src: string | undefined) => src?.startsWith('data:image'), []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setImageLoaded = React.useCallback((_unused?: boolean) => {}, []);

  // Process the image source when the component mounts or product changes
  React.useEffect(() => {
    // Debug the incoming product image
    debugImage('ProductCard - Original', product.image);
    
    // Determine raw source
    const rawSrc = product.images && product.images.length > 0 ? product.images[0].url : product.image;
    
    // First try to sanitize the URL
    const sanitizedUrl = sanitizeImageUrl(rawSrc);
    debugImage('ProductCard - Sanitized', sanitizedUrl);
    
    // Then get a valid URL or fallback
    const imageUrl = getImageWithFallback(sanitizedUrl);
    debugImage('ProductCard - Final', imageUrl);
    
    // Update the image source
    setImageSrc(imageUrl);
    
    // Log the final result for debugging
    console.log(`Product ${product.id} (${product.name}): Image ${imageUrl === '/placeholder.svg' ? 'FALLBACK' : 'OK'}`);
  }, [product.image, product.id, product.name, product.images]);

  const handleAddToCart = async () => {
    if (onAddToCart) {
      setIsLoading(true);
      try {
        await onAddToCart(product);
        toast.success(`${product.name} added to cart!`);
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add item to cart');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to manage your wishlist');
      return;
    }

    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const isWishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: viewMode === 'grid' ? -4 : 0 }}
      className={`group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${
        viewMode === 'grid' ? 'h-full flex flex-col' : 'flex flex-row'
      }`}
    >
      {/* Product Image */}
      <Link href={`/product/${product.id}`}>
        <div className={`relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden ${
          viewMode === 'grid' ? 'aspect-square' : 'w-48 h-48'
        }`}>
          {product.featured && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg z-10 font-medium">
              Featured
            </div>
          )}
          
          {/* Wishlist Button */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              handleWishlistToggle();
            }}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all duration-200 z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart 
              className={`w-5 h-5 transition-colors duration-200 ${
                isWishlisted 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-600 hover:text-red-500'
              }`} 
            />
          </motion.button>
          
          {!imageError ? (
            // EDIT: If the image is a data URL, render a plain <img> to avoid next/image optimisation issues.
            isDataUrl(imageSrc) ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className="absolute inset-0 w-full h-full object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                unoptimized={isDataUrl(imageSrc)}
                priority={priority}
              />
            )
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">Image not available</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-full p-2 shadow-lg"
            >
              <Eye className="w-5 h-5 text-gray-700" />
            </motion.div>
          </div>
        </div>
      </Link>

              {/* Product Info */}
        <div className={`flex-1 flex flex-col ${
          viewMode === 'grid' ? 'p-6' : 'p-8'
        }`}>
        {/* Category */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-orange-600 font-medium mb-2"
        >
          {product.category}
        </motion.p>
        
        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <motion.h4 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors line-clamp-2 ${
              viewMode === 'grid' ? 'text-lg' : 'text-xl'
            }`}
          >
            {product.name}
          </motion.h4>
        </Link>

        {/* Description (if available) */}
        {product.description && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1"
          >
            {product.description}
          </motion.p>
        )}

        {/* Price and Rating */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-4"
        >
          <span className={`font-bold text-gray-900 ${
            viewMode === 'grid' ? 'text-lg' : 'text-2xl'
          }`}>
            {product.price.toFixed(2)} <span className="text-base font-normal text-orange-600">EGP</span>
          </span>
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">({product.rating})</span>
          </div>
        </motion.div>

        {/* Stock Status */}
        {product.inStock !== undefined && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-4"
          >
            {product.inStock ? (
              <div className="flex items-center text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                In Stock
              </div>
            ) : (
              <div className="flex items-center text-red-600 text-sm font-medium">
                <XCircle className="w-4 h-4 mr-2" />
                Out of Stock
              </div>
            )}
          </motion.div>
        )}

        {/* Add to Cart Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleAddToCart}
          disabled={isLoading || product.inStock === false}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform mt-auto ${
            isLoading || product.inStock === false
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 active:scale-95 shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Adding...
            </div>
          ) : product.inStock === false ? (
            'Out of Stock'
          ) : (
            <div className="flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
} 