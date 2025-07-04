'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import SearchAndFilter from '@/components/SearchAndFilter';
import { useCart } from '@/contexts/CartContext';
import { sanitizeImageUrl, debugImage } from '@/utils/imageUtils';
import { Product } from '@/types';
import useSWR from 'swr';
import { ShoppingBag, Filter, Grid, List, Sparkles, Search } from 'lucide-react';

// simple fetch helper for SWR
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ProductsPage() {
  const { addItem, cart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  
  // Advanced filtering state
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    rating: 0,
  });

  const categories = [
    { id: 'all', name: 'All Products', color: 'from-gray-500 to-gray-600', icon: ShoppingBag },
    { id: 'toys-games', name: 'Toys & Games', color: 'from-orange-500 to-amber-500', icon: ShoppingBag },
    { id: 'decor', name: 'Decor', color: 'from-rose-500 to-pink-500', icon: ShoppingBag },
    { id: 'home', name: 'Home', color: 'from-emerald-500 to-teal-500', icon: ShoppingBag },
    { id: 'stationary', name: 'Stationary', color: 'from-blue-500 to-indigo-500', icon: ShoppingBag },
    { id: 'kitchen', name: 'Kitchen', color: 'from-amber-500 to-orange-500', icon: ShoppingBag },
    { id: 'pets', name: 'Pet Care', color: 'from-purple-500 to-violet-500', icon: ShoppingBag },
    { id: 'tech', name: 'Tech', color: 'from-cyan-500 to-blue-500', icon: ShoppingBag },
  ];

  // This is a more visible red square data URL for testing
  const redDotBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
  
  const defaultProducts = [
    {
      id: 1,
      name: 'Mock Product - Test Image',
      price: 9.99,
      image: redDotBase64,
      category: 'toys-games',
      rating: 5,
      description: 'This is a mock product with a red dot image. If you can see a red square, the image pipeline works!',
      inStock: true,
      featured: true,
    },
    {
      id: 2,
      name: 'Modern Wall Art Canvas',
      price: 89.99,
      image: '/placeholder.svg',
      category: 'decor',
      rating: 4.6,
      description: 'Contemporary canvas art to transform your space',
      inStock: true,
      featured: true,
    },
    {
      id: 3,
      name: 'Smart Kitchen Organizer',
      price: 45.99,
      image: '/placeholder.svg',
      category: 'home',
      rating: 4.7,
      description: 'Revolutionary kitchen storage solution',
      inStock: true,
      featured: true,
    },
    {
      id: 4,
      name: 'Premium Pet Bed',
      price: 39.99,
      image: '/placeholder.svg',
      category: 'pets',
      rating: 4.9,
      description: 'Luxurious comfort for your beloved pets',
      inStock: true,
      featured: true,
    },
    {
      id: 5,
      name: 'Ergonomic Office Chair',
      price: 199.99,
      image: '/placeholder.svg',
      category: 'stationary',
      rating: 4.5,
      description: 'Comfortable and supportive office chair',
      inStock: true,
      featured: true,
    },
    {
      id: 6,
      name: 'Designer Phone Case',
      price: 24.99,
      image: '/placeholder.svg',
      category: 'tech',
      rating: 4.3,
      description: 'Stylish and protective phone case',
      inStock: true,
      featured: true,
    },
    {
      id: 7,
      name: 'Smart Home Hub',
      price: 149.99,
      image: '/placeholder.svg',
      category: 'tech',
      rating: 4.4,
      description: 'Control your home with voice commands',
      inStock: false,
      featured: false,
    },
    {
      id: 8,
      name: 'Garden Tool Set',
      price: 34.99,
      image: '/placeholder.svg',
      category: 'home',
      rating: 4.6,
      description: 'Complete set of essential garden tools',
      inStock: true,
      featured: true,
    },
  ];

  const { data: productsData } = useSWR<Product[]>("/api/products", fetcher, { refreshInterval: 0 });
  const [products, setProducts] = useState<Product[]>(defaultProducts);

  useEffect(() => {
    if (productsData) setProducts(productsData);
  }, [productsData]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.filter(cat => cat && cat.trim() !== '');
  }, [products]);

  // Advanced filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search query filter
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Price range filter
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && product.rating < filters.rating) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  // Legacy category filter (for backward compatibility)
  const categoryFilteredProducts = filteredProducts.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  );

  const sortedProducts = [...categoryFilteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleAddToCart = useCallback(async (product: Product) => {
    await addItem(product);
  }, [addItem]);

  // Filter handlers - memoized with useCallback to prevent infinite re-renders
  const handleSearchChange = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  const handlePriceRangeChange = useCallback((min: number, max: number) => {
    setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
  }, []);

  const handleRatingChange = useCallback((rating: number) => {
    setFilters(prev => ({ ...prev, rating }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      query: '',
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      rating: 0,
    });
  }, []);

  // Add a handler for sort change
  const handleSortChange = useCallback((sort: string) => setSortBy(sort), []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner message="Loading amazing products..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Amazing Products
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of premium products that transform your space and enhance your life
          </p>
        </motion.div>

        {/* Quick Category Bubbles */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setFilters((prev) => ({ ...prev, category: category.id === 'all' ? '' : category.id }))}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                filters.category === category.id || (category.id === 'all' && !filters.category)
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
              aria-pressed={filters.category === category.id || (category.id === 'all' && !filters.category)}
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </button>
          ))}
        </div>

        {/* Enhanced Search and Filter */}
        <SearchAndFilter
          onSearchChange={handleSearchChange}
          onCategoryChange={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
          onPriceRangeChange={(min, max) => setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }))}
          onRatingChange={(rating) => setFilters((prev) => ({ ...prev, rating }))}
          onClearFilters={handleClearFilters}
          categories={availableCategories}
          currentFilters={filters}
          onSortChange={handleSortChange}
          sortBy={sortBy}
        />

        {/* Legacy Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-orange-500" />
                Quick Categories
              </h3>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <category.icon className="w-4 h-4" />
                    {category.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* View Mode and Sort Controls */}
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Filter */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 shadow-sm"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6 flex items-center justify-between"
        >
          <p className="text-gray-600">
            Showing <span className="font-semibold text-orange-600">{sortedProducts.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{products.length}</span> products
          </p>
          
          {sortedProducts.length > 0 && (
            <div className="text-sm text-gray-500">
              {viewMode === 'grid' ? 'Grid View' : 'List View'}
            </div>
          )}
        </motion.div>

        {/* Products Grid/List */}
        <motion.div
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            : "space-y-6"
          }
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="sync">
            {sortedProducts.map((product, index) => {
              // Process the image URL
              let processedImage;
              
              if (product.image) {
                // Debug the original image
                debugImage(`Product ${product.id} - Original`, product.image);
                
                // Try to sanitize the image URL
                const sanitizedImage = sanitizeImageUrl(product.image);
                debugImage(`Product ${product.id} - Sanitized`, sanitizedImage);
                
                processedImage = sanitizedImage;
              } else {
                processedImage = '/placeholder.svg';
              }
              
              // Create a new product object with the processed image
              const processedProduct = {
                ...product,
                image: processedImage
              };
              
              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  className={viewMode === 'list' ? 'bg-white rounded-2xl shadow-lg p-6' : ''}
                >
                  <ProductCard 
                    product={processedProduct} 
                    onAddToCart={handleAddToCart}
                    viewMode={viewMode}
                    cart={cart}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No products found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your filters or browse all products to discover amazing items
            </p>
            <motion.button
              onClick={() => {
                setSelectedCategory('all');
                handleClearFilters();
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Products
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 