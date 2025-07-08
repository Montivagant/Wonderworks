'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageCircle, Calendar } from 'lucide-react';
import { Review } from '@/types';

interface ReviewListProps {
  productId: number;
  refreshTrigger: number;
}

export default function ReviewList({ productId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}/reviews`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const reviewsData = await response.json();
        setReviews(reviewsData);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, refreshTrigger]);

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-4 font-sans">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-neutral-200 animate-pulse">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-neutral-200 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-neutral-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-neutral-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-50 border border-red-200 rounded-xl p-6 text-center font-sans"
      >
        <p className="text-red-600">{error}</p>
      </motion.div>
    );
  }

  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-50 rounded-xl p-8 text-center font-sans"
      >
        <MessageCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Reviews Yet</h3>
        <p className="text-neutral-700">
          Be the first to share your experience with this product!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Customer Reviews ({reviews.length})
        </h3>
        {reviews.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
          </button>
        )}
      </div>

      {/* Reviews List */}
      <AnimatePresence mode="wait">
        <div className="space-y-4">
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-sm transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{review.author}</p>
                    <div className="flex items-center text-sm text-neutral-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : 'Recently'}
                    </div>
                  </div>
                </div>
                
                {/* Rating */}
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-neutral-900">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p className="text-neutral-700 leading-relaxed">{review.comment}</p>
              )}

              {/* Review Footer */}
              <div className="mt-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center text-xs text-neutral-500">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Verified Purchase
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Show More/Less Button */}
      {reviews.length > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center pt-4"
        >
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
          </button>
        </motion.div>
      )}
    </div>
  );
} 