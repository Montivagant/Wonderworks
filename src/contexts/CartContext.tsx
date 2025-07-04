'use client';

import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { Cart, Product } from '@/types';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCartItems: () => Promise<void>;
  isAuthenticated: boolean;
}

const EMPTY_CART: Cart = { items: [], total: 0, itemCount: 0 };

// Local storage key for temporary cart
const TEMP_CART_KEY = 'wonderworks_temp_cart';

// Helper functions for localStorage
const getTempCart = (): Cart => {
  if (typeof window === 'undefined') return EMPTY_CART;
  try {
    const stored = localStorage.getItem(TEMP_CART_KEY);
    return stored ? JSON.parse(stored) : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
};

const setTempCart = (cart: Cart) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEMP_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save temp cart:', error);
  }
};

const clearTempCart = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TEMP_CART_KEY);
  } catch (error) {
    console.error('Failed to clear temp cart:', error);
  }
};

// Calculate cart totals
const calculateCartTotals = (items: Cart['items']): { total: number; itemCount: number } => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

const fetcher = async (url: string): Promise<Cart> => {
  console.log('🛒 [CartContext] Fetching cart from:', url);
  const res = await fetch(url, { credentials: 'include' });
  console.log('🛒 [CartContext] Cart fetch response status:', res.status);
  
  if (res.status === 401) {
    console.log('🛒 [CartContext] User not authenticated, returning empty cart');
    return EMPTY_CART;
  }
  
  if (!res.ok) {
    console.error('🛒 [CartContext] Cart fetch failed:', res.status, res.statusText);
    throw new Error('Failed to fetch cart');
  }
  
  const cartData = await res.json();
  console.log('🛒 [CartContext] Cart data received:', cartData);
  return cartData;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [tempCart, setTempCartState] = React.useState<Cart>(EMPTY_CART);

  console.log('🛒 [CartContext] Session status:', status);
  console.log('🛒 [CartContext] Session data:', session);

  // Load temp cart from localStorage on mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      const stored = getTempCart();
      setTempCartState(stored);
      console.log('🛒 [CartContext] Loaded temp cart from localStorage:', stored);
    }
  }, [status]);

  // Only fetch server cart when authenticated
  const { data: serverCart = EMPTY_CART, mutate, error } = useSWR<Cart>(
    status === 'authenticated' ? '/api/cart' : null,
    fetcher,
    {
      fallbackData: EMPTY_CART,
    }
  );

  // Function to migrate temp cart items to server
  const migrateTempCartToServer = useCallback(async () => {
    if (!session?.user?.email || tempCart.items.length === 0) return;

    console.log('🛒 [CartContext] Migrating temp cart to server:', tempCart.items.length, 'items');
    
    try {
      // Add each item from temp cart to server cart
      for (const item of tempCart.items) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity
          })
        });
      }
      
      // Clear temp cart after successful migration
      setTempCartState(EMPTY_CART);
      localStorage.removeItem('tempCart');
      console.log('🛒 [CartContext] Temp cart migrated successfully');
      
      // Refresh server cart
      mutate();
    } catch (error) {
      console.error('🛒 [CartContext] Failed to migrate temp cart:', error);
    }
  }, [session?.user?.email, tempCart.items, mutate]);

  // Migrate temp cart to server when user logs in
  useEffect(() => {
    if (status === 'authenticated' && session?.user && tempCart.items.length > 0) {
      migrateTempCartToServer();
    }
  }, [status, session, tempCart.items.length, migrateTempCartToServer]);

  // Sync temp cart to localStorage whenever it changes
  useEffect(() => {
    if (status === 'unauthenticated') {
      setTempCart(tempCart);
      console.log('🛒 [CartContext] Saved temp cart to localStorage:', tempCart);
    }
  }, [tempCart, status]);

  // Use server cart if authenticated, temp cart if not
  const cart = status === 'authenticated' ? serverCart : tempCart;
  const isAuthenticated = status === 'authenticated';

  console.log('🛒 [CartContext] Current cart state:', cart);
  console.log('🛒 [CartContext] Is authenticated:', isAuthenticated);
  
  if (error) {
    console.error('🛒 [CartContext] SWR error:', error);
  }

  // Helper to refresh cart after mutation
  const refresh = () => {
    console.log('🛒 [CartContext] Refreshing cart...');
    if (isAuthenticated) {
      mutate();
    }
  };

  const addItem = async (product: Product) => {
    console.log('🛒 [CartContext] addItem called with product:', product);
    console.log('🛒 [CartContext] Current auth status:', status);
    
    if (isAuthenticated) {
      // Authenticated user - use server cart
      try {
        console.log('🛒 [CartContext] Sending POST request to /api/cart');
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
        
        console.log('🛒 [CartContext] Add item response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🛒 [CartContext] Add item failed:', response.status, errorText);
          throw new Error(`Failed to add item: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log('🛒 [CartContext] Add item success:', result);
        
        console.log('🛒 [CartContext] Refreshing cart after add...');
        refresh();
        toast.success(`${product.name} added to cart!`);
      } catch (error) {
        console.error('🛒 [CartContext] Error adding item to cart:', error);
        toast.error('Failed to add item to cart');
      }
    } else {
      // Unauthenticated user - use temp cart
      console.log('🛒 [CartContext] Adding to temp cart');
      const currentItems = [...tempCart.items];
      const existingItemIndex = currentItems.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        currentItems[existingItemIndex].quantity += 1;
      } else {
        // Add new item
        currentItems.push({
          productId: product.id,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          inStock: product.inStock ?? true,
        });
      }
      
      const { total, itemCount } = calculateCartTotals(currentItems);
      const newCart = { items: currentItems, total, itemCount };
      
      setTempCartState(newCart);
      toast.success(`${product.name} added to cart!`);
      console.log('🛒 [CartContext] Temp cart updated:', newCart);
    }
  };

  const removeItem = async (productId: number) => {
    console.log('🛒 [CartContext] removeItem called with productId:', productId);
    
    if (isAuthenticated) {
      // Authenticated user - use server cart
      try {
        const response = await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        
        console.log('🛒 [CartContext] Remove item response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🛒 [CartContext] Remove item failed:', response.status, errorText);
          throw new Error(`Failed to remove item: ${response.status} ${errorText}`);
        }
        
        console.log('🛒 [CartContext] Refreshing cart after remove...');
        refresh();
        toast.success('Item removed from cart');
      } catch (error) {
        console.error('🛒 [CartContext] Error removing item from cart:', error);
        toast.error('Failed to remove item from cart');
      }
    } else {
      // Unauthenticated user - use temp cart
      console.log('🛒 [CartContext] Removing from temp cart');
      const currentItems = tempCart.items.filter(item => item.productId !== productId);
      const { total, itemCount } = calculateCartTotals(currentItems);
      const newCart = { items: currentItems, total, itemCount };
      
      setTempCartState(newCart);
      toast.success('Item removed from cart');
      console.log('🛒 [CartContext] Temp cart updated:', newCart);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    console.log('🛒 [CartContext] updateQuantity called with productId:', productId, 'quantity:', quantity);
    
    if (quantity <= 0) {
      console.log('🛒 [CartContext] Quantity <= 0, removing item instead');
      await removeItem(productId);
      return;
    }

    if (isAuthenticated) {
      // Authenticated user - use server cart
      try {
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
        });
        
        console.log('🛒 [CartContext] Update quantity response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🛒 [CartContext] Update quantity failed:', response.status, errorText);
          throw new Error(`Failed to update quantity: ${response.status} ${errorText}`);
        }
        
        console.log('🛒 [CartContext] Refreshing cart after quantity update...');
        refresh();
        toast.success('Cart updated');
      } catch (error) {
        console.error('🛒 [CartContext] Error updating quantity:', error);
        toast.error('Failed to update cart');
      }
    } else {
      // Unauthenticated user - use temp cart
      console.log('🛒 [CartContext] Updating temp cart quantity');
      const currentItems = [...tempCart.items];
      const itemIndex = currentItems.findIndex(item => item.productId === productId);
      
      if (itemIndex >= 0) {
        currentItems[itemIndex].quantity = quantity;
        const { total, itemCount } = calculateCartTotals(currentItems);
        const newCart = { items: currentItems, total, itemCount };
        
        setTempCartState(newCart);
        toast.success('Cart updated');
        console.log('🛒 [CartContext] Temp cart updated:', newCart);
      }
    }
  };

  const clearCartItems = async () => {
    console.log('🛒 [CartContext] clearCartItems called');
    
    if (isAuthenticated) {
      // Authenticated user - use server cart
      try {
        const response = await fetch('/api/cart', { method: 'DELETE' });
        console.log('🛒 [CartContext] Clear cart response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🛒 [CartContext] Clear cart failed:', response.status, errorText);
          throw new Error(`Failed to clear cart: ${response.status} ${errorText}`);
        }
        
        console.log('🛒 [CartContext] Refreshing cart after clear...');
        refresh();
        toast.success('Cart cleared');
      } catch (error) {
        console.error('🛒 [CartContext] Error clearing cart:', error);
        toast.error('Failed to clear cart');
      }
    } else {
      // Unauthenticated user - use temp cart
      console.log('🛒 [CartContext] Clearing temp cart');
      setTempCartState(EMPTY_CART);
      clearTempCart();
      toast.success('Cart cleared');
      console.log('🛒 [CartContext] Temp cart cleared');
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCartItems,
      isAuthenticated 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 