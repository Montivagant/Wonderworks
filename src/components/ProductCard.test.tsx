import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';
import { Product } from '@/types';

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
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/99.99/)).toBeInTheDocument();
  });
}); 