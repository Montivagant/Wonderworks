'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import useSWR from 'swr';
import { Wishlist, Product } from '@/types';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlist: Wishlist;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  isAuthenticated: boolean;
}

const EMPTY_WISHLIST: Wishlist = { items: [], itemCount: 0 };

const fetcher = async (url: string): Promise<Wishlist> => {
  const res = await fetch(url, { credentials: 'include' });
  
  if (res.status === 401) {
    return EMPTY_WISHLIST;
  }
  
  if (!res.ok) {
    throw new Error('Failed to fetch wishlist');
  }
  
  const data = await res.json();
  return data;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();

  // Only fetch wishlist when authenticated
  const { data: wishlist = EMPTY_WISHLIST, mutate, error } = useSWR<Wishlist>(
    status === 'authenticated' ? '/api/wishlist' : null,
    fetcher,
    {
      fallbackData: EMPTY_WISHLIST,
    }
  );

  const isAuthenticated = status === 'authenticated';

  if (error) {
    console.error('Wishlist SWR error:', error);
  }

  const addToWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your wishlist');
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Item already in wishlist') {
          toast.error('Item is already in your wishlist');
        } else {
          throw new Error('Failed to add to wishlist');
        }
        return;
      }

      await mutate();
      toast.success(`${product.name} added to wishlist!`);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add item to wishlist');
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to manage your wishlist');
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      await mutate();
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlist.items.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isAuthenticated,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
} 