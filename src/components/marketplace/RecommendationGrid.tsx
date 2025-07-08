'use client';

import Link from 'next/link';
import useSWR from 'swr';
import ProductCard from '@/components/ProductCard';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function RecommendationGrid() {
  const { data: products = [] } = useSWR('/api/products', fetcher);
  const recommended = products.filter((p: any) => p.isRecommended);
  return (
    <section className="bg-neutral-50 py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Recommended for You</h2>
          <p className="text-neutral-600">Based on your browsing history and preferences</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommended.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white border border-neutral-300 text-neutral-700 px-6 py-3 rounded-md hover:bg-neutral-50 transition-colors font-medium"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
} 