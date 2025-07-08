'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, Heart, User, Menu, LayoutDashboard, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';
import { useSession, signOut } from 'next-auth/react';

export default function SiteHeader() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  return (
    <header
      className={`sticky top-0 z-50 h-14 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur border-b border-neutral-200 shadow-md'
          : 'bg-white border-b border-neutral-200 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-full flex items-center justify-between gap-2 font-sans">
        {/* left: logo + menu */}
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="sm" className="lg:hidden p-1.5" aria-label="Open menu">
            <Menu className="w-5 h-5 text-neutral-700" />
          </Button>
          <Link href="/" className="text-lg font-semibold text-neutral-900 whitespace-nowrap">WonderWorks</Link>
        </div>
        {/* search */}
        <form onSubmit={submit} className="flex flex-1 max-w-md mx-2">
          <Input
            aria-label="Search products"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="rounded-r-none"
          />
          <Button type="submit" size="sm" className="rounded-l-none">
            Search
          </Button>
        </form>
        {/* right icons */}
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="p-1.5" aria-label="Wishlist">
            <Link href="/wishlist" className="text-neutral-700 hover:text-primary-600">
              <Heart className="w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="p-1.5" aria-label="Cart">
            <Link href="/cart" className="text-neutral-700 hover:text-primary-600">
              <ShoppingCart className="w-5 h-5" />
            </Link>
          </Button>
          {/* Session loading state */}
          {status === 'loading' ? (
            <div className="w-8 h-8 flex items-center justify-center animate-pulse">
              <User className="w-5 h-5 text-neutral-400" />
            </div>
          ) : session ? (
            <>
              {/* Admin dashboard link for admins */}
              {session.user?.role === 'ADMIN' && (
                <Button asChild variant="ghost" size="sm" className="p-1.5" aria-label="Dashboard">
                  <Link href="/admin" className="text-primary-700 hover:text-primary-900 flex items-center gap-1">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
                  </Link>
                </Button>
              )}
              {/* Profile dropdown or link */}
              <Button asChild variant="ghost" size="sm" className="p-1.5" aria-label="Account">
                <Link href="/profile" className="text-neutral-700 hover:text-primary-600">
                  <User className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="p-1.5" aria-label="Logout" onClick={() => signOut()}>
                <LogIn className="w-5 h-5 rotate-180 text-neutral-700" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="p-1.5" aria-label="Login">
                <Link href="/login" className="text-primary-700 hover:text-primary-900 flex items-center gap-1">
                  <LogIn className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Login</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 