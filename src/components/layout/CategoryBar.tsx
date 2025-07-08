'use client';
import useSWR from 'swr';
import Link from 'next/link';
import { Category } from '@/types';
import { useEffect, useState } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CategoryBar() {
  const { data: categories = [] } = useSWR<Category[]>("/api/categories", fetcher);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (categories.length === 0) return null;
  return (
    <nav
      aria-label="Categories"
      className={`w-full transition-all duration-300 z-40 sticky top-14 ${
        scrolled
          ? 'bg-white/70 backdrop-blur-sm border-b border-neutral-200 shadow-sm py-1 text-sm min-h-[36px]'
          : 'bg-white border-b border-neutral-200 shadow-sm py-2 text-base min-h-[44px]'
      }`}
    >
      <div className="w-full flex justify-center font-sans">
        <ul className="flex gap-3 px-4 whitespace-nowrap max-w-full overflow-x-auto justify-center transition-all duration-300">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/products?category=${cat.slug}`}
                className="text-sm text-neutral-700 hover:text-primary-600 font-medium transition-colors"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
} 