'use client';

import HeroSection from '@/components/landing/HeroSection';
import CategoriesSection from '@/components/landing/CategoriesSection';
import FeaturedProductsSection from '@/components/landing/FeaturedProductsSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import NewsletterSection from '@/components/landing/NewsletterSection';
import CTASection from '@/components/landing/CTASection';
import { Product } from '@/types';
import useSWR from 'swr';

// simple fetch helper for SWR
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Home() {
  const { data: products = [] } = useSWR<Product[]>("/api/products", fetcher);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <CategoriesSection />

      {/* Featured Products Section */}
      <FeaturedProductsSection products={products} />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Final CTA Section */}
      <CTASection />
    </div>
  );
}