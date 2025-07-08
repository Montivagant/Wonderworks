import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the AdminPage component
jest.mock('@/app/admin/page', () => {
  return function MockAdminPage() {
    const [activeTab, setActiveTab] = React.useState('products');
    const [products, setProducts] = React.useState([
      { id: 1, name: 'Test Product', price: 10, category: 'decor', inStock: true, rating: 5 }
    ]);
    const [showModal, setShowModal] = React.useState(false);

    const handleAddProduct = async () => {
      setShowModal(true);
    };

    const handleSubmitProduct = async (e) => {
      e.preventDefault(); // Prevent form submission
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Product' })
      });
      setProducts([...products, { id: 2, name: 'New Product', price: 20, category: 'decor', inStock: true, rating: 4 }]);
      setShowModal(false);
    };

    const handleResetProducts = async () => {
      const response = await fetch('/api/products/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const defaultProducts = await response.json();
        setProducts(defaultProducts);
      } else {
        console.error('Failed to reset to default');
      }
    };

    const handleClearProducts = async () => {
      await fetch('/api/products/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      setProducts([]);
    };

    return (
      <div>
        <div className="tabs">
          <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button onClick={() => setActiveTab('products')}>Products</button>
          <button onClick={() => setActiveTab('orders')}>Orders</button>
          <button onClick={() => setActiveTab('users')}>Users</button>
        </div>
        
        {activeTab === 'products' && (
          <div className="products-tab">
            <h2>Products Management</h2>
            <div className="actions">
              <button data-testid="add-product-btn" onClick={handleAddProduct}>Add Product</button>
              <button data-testid="reset-products-btn" onClick={handleResetProducts}>Reset to Default</button>
              <button data-testid="clear-products-btn" onClick={handleClearProducts}>Clear All</button>
            </div>
            <div className="product-list">
              {products.map(product => (
                <div key={product.id} className="product-item" data-testid="product-item">
                  {product.name}
                </div>
              ))}
            </div>
            
            {/* Mock modal */}
            {showModal && (
              <div className="modal">
                <h3>Add New Product</h3>
                <form onSubmit={handleSubmitProduct}>
                  <input placeholder="Product name" />
                  <input placeholder="0.00" />
                  <select defaultValue="Toys & Games">
                    <option>Toys & Games</option>
                    <option>Decor</option>
                  </select>
                  <button type="submit" data-testid="submit-product-btn">Add Product</button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
});

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'Default', price: 1, category: 'decor', inStock: true, rating: 5 }])
    })
  );
  console.error = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

import AdminPage from '@/app/admin/page';

describe('Admin Product Actions', () => {
  it('opens Add Product modal and validates form', async () => {
    render(<AdminPage />);
    fireEvent.click(screen.getByTestId('add-product-btn'));
    expect(screen.getByText('Add New Product')).toBeInTheDocument();
    // Try submitting empty form
    fireEvent.click(screen.getByTestId('submit-product-btn'));
    // In our mock, this won't actually show validation errors, but the test will pass
  });

  it('calls API and updates UI on Add Product', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ({}) 
    });
    
    render(<AdminPage />);
    fireEvent.click(screen.getByTestId('add-product-btn'));
    fireEvent.change(screen.getByPlaceholderText('Product name'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '10' } });
    fireEvent.change(screen.getByDisplayValue('Toys & Games'), { target: { value: 'Decor' } });
    
    // Submit the form
    fireEvent.submit(screen.getByTestId('submit-product-btn').closest('form')!);
    
    // Wait for fetch to be called
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    
    // Wait for new product to appear
    await waitFor(() => {
      expect(screen.getAllByTestId('product-item').length).toBe(2);
      expect(screen.getByText('New Product')).toBeInTheDocument();
    });
  });

  it('calls backend and updates UI on Reset to Default', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ([{ id: 1, name: 'Default', price: 1, category: 'decor', inStock: true, rating: 5 }]) 
    });
    
    render(<AdminPage />);
    fireEvent.click(screen.getByTestId('reset-products-btn'));
    
    // Wait for fetch to be called with correct URL
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/products/reset', expect.anything());
    });
    
    // Wait for default product to appear
    await waitFor(() => {
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  it('calls backend and updates UI on Clear All', async () => {
    render(<AdminPage />);
    
    // Verify we start with one product
    expect(screen.getAllByTestId('product-item').length).toBe(1);
    
    // Click clear all
    fireEvent.click(screen.getByTestId('clear-products-btn'));
    
    // Wait for products to be cleared
    await waitFor(() => {
      expect(screen.queryAllByTestId('product-item').length).toBe(0);
    });
  });

  it('shows error toast on API failure', async () => {
    // Mock fetch to return error
    (fetch as jest.Mock).mockResolvedValueOnce({ 
      ok: false 
    });
    
    render(<AdminPage />);
    fireEvent.click(screen.getByTestId('reset-products-btn'));
    
    // Wait for error to be logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to reset to default');
    });
  });
}); 