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
import { useCart } from '@/contexts/CartContext';

interface CartItem {
  productId: number;
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => Promise<void>;
  priority?: boolean;
  viewMode?: 'grid' | 'list';
  cart?: { items: CartItem[] };
}

export default function ProductCard({ product, onAddToCart, priority = false, viewMode = 'grid', cart }: ProductCardProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState<string>('/placeholder.svg');
  const { addToWishlist, removeFromWishlist, isInWishlist, isAuthenticated } = useWishlist();
  const { updateQuantity, removeItem } = useCart();
  
  // NEW: helper to detect data URLs
  const isDataUrl = React.useCallback((src: string | undefined) => src?.startsWith('data:image'), []);

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
  
  }, [product.image, product.id, product.name, product.images]);

  const handleAddToCart = async () => {
    if (onAddToCart) {
      setIsLoading(true);
      try {
        await onAddToCart(product);
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

  // Find if product is in cart
  const cartItem = cart?.items?.find?.((item: CartItem) => item.productId === product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: viewMode === 'grid' ? -4 : 0 }}
      className={`group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-100 font-sans ${
        viewMode === 'grid' ? 'h-full flex flex-col' : 'flex flex-row'
      }`}
    >
      {/* Product Image */}
      <Link href={`/product/${product.id}`}>
        <div className={`relative bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden ${
          viewMode === 'grid' ? 'aspect-square' : 'w-48 h-48'
        }`}>
          {product.featured && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-primary-500 to-primary-400 text-white text-xs px-2 py-0.5 rounded-full shadow-lg z-10 font-medium">
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
                  : 'text-neutral-700 hover:text-red-500'
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
                onLoad={undefined}
                onError={() => setImageError(true)}
              />
            ) : (
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className="absolute inset-0 w-full h-full object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoad={undefined}
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
        }`