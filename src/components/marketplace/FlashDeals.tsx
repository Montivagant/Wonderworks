'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Zap } from 'lucide-react';
import useSWR from 'swr';
import ProductCard from '@/components/ProductCard';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!endTime) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const distance = end - now;
      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor(distance / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (!endTime) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="w-4 h-4 text-red-500" />
      <span className="font-mono">
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function FlashDeals() {
  const { data: products = [] } = useSWR('/api/products', fetcher);
  const flashDeals = products.filter((p: any) => p.isFlashDeal && p.inStock !== false && !p.archived);
  return (
    <section className="bg-white py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-bold text-neutral-900">Flash Deals</h2>
          </div>
          <Link href="/products?sale=flash" className="text-primary-600 hover:text-primary-700 font-medium">
            View All {flashDeals.length}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashDeals.map((product: any) => {
            const discount = product.originalPrice && product.originalPrice > 0
              ? Math.round(100 * (1 - product.price / product.originalPrice))
              : 0;
            return (
              <div key={product.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative">
                {discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    -{discount}%
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <CountdownTimer endTime={product.flashDealEndTime} />
                </div>
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 