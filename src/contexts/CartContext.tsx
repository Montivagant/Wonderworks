'use client';

import React, { createContext, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { Product } from '@/types';

interface CartItem {
  productId: number;
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  inStock: boolean;
}

interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface CartContextType {
  cart: Cart;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCartItems: () => Promise<void>;
  isAuthenticated: boolean;
}

const EMPTY_CART: Cart = { items: [], total: 0, itemCount: 0 };

// Local storage helpers
const getTempCart = (): Cart => {
  if (typeof window === 'undefined') return EMPTY_CART;
  try {
    const stored = localStorage.getItem('tempCart');
    return stored ? JSON.parse(stored) : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
};

const setTempCart = (cart: Cart) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('tempCart', JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save temp cart:', error);
  }
};

const clearTempCart = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('tempCart');
  } catch (error) {
    console.error('Failed to clear temp cart:', error);
  }
};

const calculateCartTotals = (items: Cart['items']): { total: number; itemCount: number } => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

function ensureValidCart(cart: any): Cart {
  if (!cart || !Array.isArray(cart.items)) {
    return EMPTY_CART;
  }
  
  const validItems = cart.items.filter((item: any) => 
    item && typeof item.productId === 'number' && 
    typeof item.name === 'string' && 
    typeof item.price === 'number' && 
    typeof item.quantity === 'number' && 
    item.quantity > 0
  );
  
  const { total, itemCount } = calculateCartTotals(validItems);
  return { items: validItems, total, itemCount };
}

const fetcher = async (url: string): Promise<Cart> => {
  const res = await fetch(url, { credentials: 'include' });
  
  if (res.status === 401) {
    return EMPTY_CART;
  }
  
  if (!res.ok) {
    console.error('Cart fetch failed:', res.status, res.statusText);
    throw new Error('Failed to fetch cart');
  }
  
  const apiData = await res.json();
  const cartData = apiData?.cart;
  return ensureValidCart(cartData ?? EMPTY_CART);
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [tempCart, setTempCartState] = React.useState<Cart>(EMPTY_CART);

  // Load temp cart from localStorage on mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      const stored = ensureValidCart(getTempCart());
      setTempCartState(stored);
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
      
      // Refresh server cart
      mutate();
    } catch (error) {
      console.error('Failed to migrate temp cart:', error);
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
    }
  }, [tempCart, status]);

  // Use server cart if authenticated, temp cart if not
  const cart = ensureValidCart(status === 'authenticated' ? serverCart : tempCart);
  const isAuthenticated = status === 'authenticated';
  
  if (error) {
    console.error('SWR error:', error);
  }

  // Helper to refresh cart after mutation
  const refresh = () => {
    if (isAuthenticated) {
      mutate();
    }
  };

  const addItem = async (product: Product) => {
    if (isAuthenticated) {
      // Authenticated user - use server cart
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Add item failed:', response.status, errorText);
          throw new Error(`Failed to add item: ${response.status} ${errorText}`);
        }
        
        refresh();
        toast.success(`${product.name} added to cart!`);
      } catch (error) {
        console.error('Error adding item to cart:', error);
        toast.error('Failed to add item to cart');
      }
    } else {
      // Unauthenticated user - use temp cart
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
    }
  };

  const removeItem = async (productId: number) => {
    if (isAuthenticated) {
      // Authenticated user - use server cart
      try {
        const response = await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Remove item failed:', response.status, errorText);
          throw new Error(`Failed to remove item: ${response.status} ${errorText}`);
        }
        
        refresh();
        toast.success('Item removed from cart');
      } catch (error) {
        console.error('Error removing item from cart:', error);
        toast.error('Failed to remove item from cart');
      }
    } else {
      // Unauthenticated user - use temp cart
      const currentItems = tempCart.items.filter(item => item.productId !== productId);
      const { total, itemCount } = calculateCartTotals(currentItems);
      const newCart = { items: currentItems, total, itemCount };
      
      setTempCartState(newCart);
      toast.success('Item removed from cart');
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
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
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Update quantity failed:', response.status, errorText);
          throw new Error(`Failed to update quantity: ${response.status} ${errorText}`);
        }
        
        refresh();
        toast.success('Cart updated');
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        toast.error('Failed to update cart');
      }
    } else {
      // Unauthenticated user - use temp cart
      const currentItems = [...tempCart.items];
      const itemIndex = currentItems.findIndex(item => item.productId === productId);
      
      if (itemIndex >= 0) {
        currentItems[itemIndex].quantity = quantity;
        const { total, itemCount } = calculateCartTotals(currentItems);
        const newCart = { items: currentItems, total, itemCount };
        
        setTempCartState(newCart);
        toast.success('Cart updated');
      }
    }
  };

  const clearCartItems = async () => {
    if (isAuthenticated) {
      // Authenticated user - use server cart
      try {
        const response = await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clearAll: true }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Clear cart failed:', response.status, errorText);
          throw new Error(`Failed to clear cart: ${response.status} ${errorText}`);
        }
        
        refresh();
        toast.success('Cart cleared');
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear cart');
      }
    } else {
      // Unauthenticated user - use temp cart
      setTempCartState(EMPTY_CART);
      clearTempCart();
      toast.success('Cart cleared');
    }
  };

  const value: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCartItems,
    isAuthenticated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 