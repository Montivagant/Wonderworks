'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Star, Sparkles } from 'lucide-react';

interface SearchAndFilterProps {
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onRatingChange: (rating: number) => void;
  onClearFilters: () => void;
  categories: string[];
  currentFilters: {
    query: string;
    category: string;
    minPrice: number;
    maxPrice: number;
    rating: number;
  };
  onSortChange?: (sort: string) => void;
  sortBy?: string;
}

export default function SearchAndFilter({
  onSearchChange,
  onCategoryChange,
  onPriceRangeChange,
  onRatingChange,
  onClearFilters,
  categories,
  currentFilters,
  onSortChange,
  sortBy,
}: SearchAndFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(currentFilters.query);
  const [debouncedQuery, setDebouncedQuery] = useState(currentFilters.query);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    onSearchChange(debouncedQuery);
  }, [debouncedQuery, onSearchChange]);

  const hasActiveFilters = 
    currentFilters.query || 
    currentFilters.category || 
    currentFilters.minPrice > 0 || 
    currentFilters.maxPrice < 1000 || 
    currentFilters.rating > 0;

  const handleClearFilters = () => {
    setSearchQuery('');
    onClearFilters();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search for amazing products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-colors duration-200 text-gray-900 placeholder-gray-500"
          />
        </div>
        
        <motion.button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center space-x-2 px-6 py-4 rounded-xl border transition-all duration-200 ${
            hasActiveFilters
              ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-700 shadow-md'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-md'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          )}
        </motion.button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-sm text-gray-700 font-medium">Active filters:</span>
            
            {currentFilters.query && (
              <span className="inline-flex items-center bg-orange-100 text-orange-800 text-sm px-3 py-1.5 rounded-full font-medium">
                <Search className="w-3 h-3 mr-1" />
                &ldquo;{currentFilters.query}&rdquo;
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 hover:text-orange-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {currentFilters.category && (
              <span className="inline-flex items-center bg-emerald-100 text-emerald-800 text-sm px-3 py-1.5 rounded-full font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                {currentFilters.category}
                <button
                  onClick={() => onCategoryChange('')}
                  className="ml-2 hover:text-emerald-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {(currentFilters.minPrice > 0 || currentFilters.maxPrice < 1000) && (
              <span className="inline-flex items-center bg-purple-100 text-purple-800 text-sm px-3 py-1.5 rounded-full font-medium">
                <span className="mr-1">💰</span>
                {currentFilters.minPrice} - {currentFilters.maxPrice} EGP
                <button
                  onClick={() => onPriceRangeChange(0, 1000)}
                  className="ml-2 hover:text-purple-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {currentFilters.rating > 0 && (
              <span className="inline-flex items-center bg-amber-100 text-amber-800 text-sm px-3 py-1.5 rounded-full font-medium">
                <Star className="w-3 h-3 mr-1 fill-current" />
                {currentFilters.rating}+ stars
                <button
                  onClick={() => onRatingChange(0)}
                  className="ml-2 hover:text-amber-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-orange-600 underline font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 pt-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Category
                </label>
                <select
                  value={currentFilters.category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-colors duration-200 text-gray-900"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Price Range (EGP)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={currentFilters.minPrice || ''}
                    onChange={(e) => onPriceRangeChange(Number(e.target.value) || 0, currentFilters.maxPrice)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    min="0"
                  />
                  <span className="text-gray-500 font-medium">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={currentFilters.maxPrice === 1000 ? '' : currentFilters.maxPrice}
                    onChange={(e) => onPriceRangeChange(currentFilters.minPrice, Number(e.target.value) || 1000)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Minimum Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => onRatingChange(currentFilters.rating === rating ? 0 : rating)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg border transition-all duration-200 ${
                        currentFilters.rating >= rating
                          ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${currentFilters.rating >= rating ? 'fill-current' : ''}`} />
                      <span className="font-medium">{rating}+</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Sort By
                </label>
                <select
                  value={sortBy || 'name'}
                  onChange={(e) => onSortChange && onSortChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-colors duration-200 text-gray-900"
                  aria-label="Sort products"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 