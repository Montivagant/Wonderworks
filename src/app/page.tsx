'use client';

import PromoCarousel from '@/components/marketplace/PromoCarousel';
import FlashDeals from '@/components/marketplace/FlashDeals';
import RecommendationGrid from '@/components/marketplace/RecommendationGrid';
import TrustStrip from '@/components/marketplace/TrustStrip';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Promo Carousel */}
      <PromoCarousel />

      {/* Flash Deals */}
      <FlashDeals />

      {/* Trust Strip */}
      <TrustStrip />

      {/* Recommendation Grid */}
      <RecommendationGrid />
    </div>
  );
}