import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCard from './ProductCard';
import { Product } from '@/types';
import { WishlistProvider } from '@/contexts/WishlistContext';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated'
  })
}));

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({
    data: { items: [], itemCount: 0 },
    mutate: jest.fn(),
    error: null
  })
}));

// Mock CartContext
jest.mock('@/contexts/CartContext', () => {
  const originalModule = jest.requireActual('@/contexts/CartContext');
  
  return {
    ...originalModule,
    CartProvider: ({ children }) => <div>{children}</div>,
    useCart: () => ({
      cart: { items: [], total: 0, itemCount: 0 },
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCartItems: jest.fn(),
      isAuthenticated: false
    })
  };
});

// Mock imageUtils to avoid console logs
jest.mock('@/utils/imageUtils', () => ({
  sanitizeImageUrl: (url) => url,
  getImageWithFallback: (url) => url,
  debugImage: jest.fn()
}));

// Mock console to avoid logs
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.group = jest.fn();
  console.groupEnd = jest.fn();
});
afterAll(() => {
  console.log = originalConsole.log;
  console.group = originalConsole.group;
  console.groupEnd = originalConsole.groupEnd;
});

const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  price: 99.99,
  image: '/test.jpg',
  category: 'Test Category',
  rating: 4.5,
  description: 'A test product',
  inStock: true,
};

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(
      <WishlistProvider>
        <ProductCard product={mockProduct} />
      </WishlistProvider>
    );
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/99.99/)).toBeInTheDocument();
  });
}); 