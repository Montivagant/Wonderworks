'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Share2,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { getImageWithFallback, sanitizeImageUrl } from '@/utils/imageUtils';
import toast from 'react-hot-toast';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);

  const productId = params.id as string;

  // Process product images - moved to top to avoid initialization error
  const images = useMemo(() => {
    return product?.images && product.images.length > 0 
      ? product.images.map(img => img.url)
      : product?.image 
        ? [product.image]
        : ['/placeholder.svg'];
  }, [product?.images, product?.image]);

  const processedImages = useMemo(() => {
    return images.map(img => getImageWithFallback(sanitizeImageUrl(img)));
  }, [images]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found');
          } else {
            setError('Failed to load product');
          }
          return;
        }
        
        const productData = await response.json();
        setProduct(productData);
        
        // Fetch related products after getting the current product
        fetchRelatedProducts(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchRelatedProducts = async (currentProduct: Product) => {
    try {
      setLoadingRelated(true);
      
      // Fetch all products to find related ones
      const response = await fetch('/api/products');
      if (!response.ok) return;
      
      const allProducts: Product[] = await response.json();
      
      // Filter out the current product
      const otherProducts = allProducts.filter(p => p.id !== currentProduct.id);
      
      // Calculate similarity scores
      const scoredProducts = otherProducts.map(product => {
        let score = 0;
        const reasons: string[] = [];
        
        // Same category gets high score
        if (product.category === currentProduct.category) {
          score += 50;
          reasons.push('Same category');
        }
        
        // Similar price range gets medium score
        const priceDiff = Math.abs(product.price - currentProduct.price);
        const priceRange = currentProduct.price * 0.3; // 30% price range
        if (priceDiff <= priceRange) {
          score += 30;
          reasons.push('Similar price');
        }
        
        // Featured products get bonus
        if (product.featured) {
          score += 10;
          reasons.push('Featured');
        }
        
        // In-stock products get bonus
        if (product.inStock) {
          score += 5;
          reasons.push('In stock');
        }
        
        return { ...product, score };
      });
      
      // Sort by score and take top 4
      const topRelated = scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
      
      setRelatedProducts(topRelated);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      await addItem(product);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlist = () => {
    setWishlisted(!wishlisted);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out this amazing product: ${product?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleReviewSubmitted = () => {
    setReviewsRefreshTrigger(prev => prev + 1);
    // Refresh product data to get updated rating
    if (product) {
      fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(updatedProduct => setProduct(updatedProduct))
        .catch(console.error);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!product || processedImages.length === 0) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          setSelectedImage(prev => prev === 0 ? processedImages.length - 1 : prev - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          setSelectedImage(prev => prev === processedImages.length - 1 ? 0 : prev + 1);
          break;
        case 'Home':
          event.preventDefault();
          setSelectedImage(0);
          break;
        case 'End':
          event.preventDefault();
          setSelectedImage(processedImages.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, processedImages.length]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || processedImages.length === 0) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setSelectedImage(prev => prev === processedImages.length - 1 ? 0 : prev + 1);
    }
    if (isRightSwipe) {
      setSelectedImage(prev => prev === 0 ? processedImages.length - 1 : prev - 1);
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isHovered || processedImages.length <= 1) return;

    const interval = setInterval(() => {
      setSelectedImage(prev => prev === processedImages.length - 1 ? 0 : prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, processedImages.length]);

  // Start auto-play after 3 seconds of inactivity
  useEffect(() => {
    if (processedImages.length <= 1) return;

    const timer = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [processedImages.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-lg text-neutral-700 font-sans">Loading product...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-6">😕</div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-4 font-sans">
              {error === 'Product not found' ? 'Product Not Found' : 'Something went wrong'}
            </h1>
            <p className="text-xl text-neutral-600 mb-8 font-sans">
              {error === 'Product not found' 
                ? 'The product you\'re looking for doesn\'t exist or has been removed.'
                : 'We couldn\'t load the product details. Please try again.'
              }
            </p>
            <button
              onClick={() => router.push('/products')}
              className="bg-gradient-to-r from-primary-600 to-primary-400 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-500 transition-all duration-300 font-sans"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = product.price * quantity;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-neutral-600 font-sans">
            <li>
              <button 
                onClick={() => router.push('/')} 
                className="hover:text-primary-600 transition-colors font-sans"
              >
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button 
                onClick={() => router.push('/products')} 
                className="hover:text-primary-600 transition-colors font-sans"
              >
                Products
              </button>
            </li>
            <li>/</li>
            <li className="text-neutral-900 font-medium font-sans">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image Carousel */}
            <motion.div 
              className="relative aspect-square bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden font-sans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Carousel Container */}
              <div 
                className="relative w-full h-full"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={processedImages[selectedImage]}
                      alt={`${product.name} - Image ${selectedImage + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Auto-play indicator */}
                {isAutoPlaying && !isHovered && processedImages.length > 1 && (
                  <motion.div 
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Auto-playing
                  </motion.div>
                )}
              </div>
              
              {/* Image Navigation */}
              {processedImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev === 0 ? processedImages.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev === processedImages.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full z-10">
                    {selectedImage + 1} / {processedImages.length}
                  </div>
                </>
              )}

              {/* Featured Badge */}
              {product.featured && (
                <motion.div 
                  className="absolute top-4 left-4 bg-yellow-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  Featured
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <motion.button
                  onClick={handleWishlist}
                  className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                    wishlisted 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Share product"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Thumbnail Images */}
            {processedImages.length > 1 && (
              <div className="relative">
                <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                  {processedImages.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === index 
                          ? 'border-primary-500 scale-105' 
                          : 'border-neutral-200 hover:border-neutral-300 hover:scale-105'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`View image ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </motion.button>
                  ))}
                </div>
                
                {/* Scroll indicators for thumbnails */}
                {processedImages.length > 4 && (
                  <div className="flex justify-center space-x-1 mt-2">
                    {[...Array(Math.ceil(processedImages.length / 4))].map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          Math.floor(selectedImage / 4) === index 
                            ? 'bg-primary-500' 
                            : 'bg-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Category */}
              <div className="mb-4">
                <span className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="text-4xl font-bold text-neutral-900 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-neutral-600">({product.rating})</span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-600">Based on reviews</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">
                  {product.price.toFixed(2)} <span className="text-2xl font-normal text-neutral-500">EGP</span>
                </span>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <div className="flex items-center text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    In Stock - Ready to Ship
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 font-medium">
                    <XCircle className="w-5 h-5 mr-2" />
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Description</h3>
                  <p className="text-neutral-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-medium text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 99}
                    className="w-10 h-10 rounded-lg border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !product.inStock}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    addingToCart || !product.inStock
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-600 to-primary-400 text-white hover:from-primary-700 hover:to-primary-500 active:scale-95 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {addingToCart ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding to Cart...
                    </div>
                  ) : !product.inStock ? (
                    'Out of Stock'
                  ) : (
                    <div className="flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </div>
                  )}
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal ({quantity} items)</span>
                    <span className="font-medium">{subtotal.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `${shipping.toFixed(2)} EGP`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tax (8%)</span>
                    <span className="font-medium">{tax.toFixed(2)} EGP</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-neutral-900">Total</span>
                      <span className="font-semibold text-neutral-900">{total.toFixed(2)} EGP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-neutral-600">
                  <Truck className="w-4 h-4 mr-2" />
                  Free Shipping
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure Payment
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Easy Returns
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Products Section */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">You might also like</h2>
          
          {loadingRelated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="w-full h-32 bg-neutral-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-neutral-100 cursor-pointer"
                  onClick={() => router.push(`/product/${relatedProduct.id}`)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden">
                    <Image
                      src={getImageWithFallback(sanitizeImageUrl(relatedProduct.image))}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />
                    {relatedProduct.featured && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded shadow z-10">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 text-sm">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-neutral-900">
                        {relatedProduct.price.toFixed(2)} <span className="text-base font-normal text-neutral-500">EGP</span>
                      </span>
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(relatedProduct.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-neutral-600">({relatedProduct.rating})</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎁</div>
              <p className="text-neutral-600">No related products found</p>
            </div>
          )}
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Reviews</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <ReviewForm 
                productId={parseInt(productId)} 
                onReviewSubmitted={handleReviewSubmitted}
              />
            </div>
            
            {/* Review List */}
            <div className="lg:col-span-2">
              <ReviewList 
                productId={parseInt(productId)} 
                refreshTrigger={reviewsRefreshTrigger}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 