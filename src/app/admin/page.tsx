'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { isValidDataUrl, debugImage, sanitizeImageUrl } from '@/utils/imageUtils';
import { Product, Order } from '@/types';
import Image from 'next/image';
import useSWR from 'swr';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import UserManagement from '@/components/admin/UserManagement';

// Mock data
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Premium Wooden Puzzle Set',
    price: 29.99,
    category: 'Toys & Games',
    inStock: true,
    rating: 4.8,
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Modern Wall Art Canvas',
    price: 89.99,
    category: 'Decor',
    inStock: true,
    rating: 4.6,
    createdAt: '2024-01-10',
  },
  {
    id: 3,
    name: 'Smart Kitchen Organizer',
    price: 45.99,
    category: 'Household',
    inStock: true,
    rating: 4.7,
    createdAt: '2024-01-12',
  },
  {
    id: 4,
    name: 'Premium Pet Bed',
    price: 39.99,
    category: 'Pet Care',
    inStock: false,
    rating: 4.9,
    createdAt: '2024-01-08',
  },
];

const mockOrders: Order[] = [
  {
    id: 1001,
    customerName: 'John Doe',
    total: 89.98,
    status: 'pending',
    date: '2024-01-20',
    items: [
      {
        id: 1,
        productId: 1,
        name: 'Test Product',
        price: 44.99,
        quantity: 2
      }
    ],
  },
  {
    id: 1002,
    customerName: 'Jane Smith',
    total: 149.97,
    status: 'processing',
    date: '2024-01-19',
    items: [
      {
        id: 2,
        productId: 2,
        name: 'Modern Wall Art',
        price: 89.99,
        quantity: 1
      },
      {
        id: 3,
        productId: 3,
        name: 'Smart Organizer',
        price: 59.98,
        quantity: 1
      }
    ],
  },
  {
    id: 1003,
    customerName: 'Mike Johnson',
    total: 45.99,
    status: 'shipped',
    date: '2024-01-18',
    items: [
      {
        id: 4,
        productId: 4,
        name: 'Kitchen Tool',
        price: 45.99,
        quantity: 1
      }
    ],
  },
];

// Type definition for tabs
type TabId = 'dashboard' | 'products' | 'orders' | 'users';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'createdAt' | 'images'>>({
    name: '',
    price: 0,
    category: '',
    inStock: true,
    rating: 0,
  });
  // image previews state
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);

  // Load products from API using SWR
  const { data: apiProducts, mutate } = useSWR<Product[]>("/api/products", fetcher);

  useEffect(() => {
    if (apiProducts) setProducts(apiProducts);
  }, [apiProducts]);

  const lowStockProducts = products.filter(p => !p.inStock).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    import('@/utils/imageUtils').then(({ processImageFile, debugImage }) => {
      Promise.all(
        files.map(async (file) => {
          try {
            const dataUrl = await processImageFile(file);
            debugImage('Admin - Image Upload - Processed', dataUrl);
            if (!dataUrl.startsWith('data:image/')) throw new Error('Invalid data URL');
            return dataUrl;
          } catch (err) {
            console.error(err);
            toast.error(`Failed to process ${file.name}`);
            return null;
          }
        })
      ).then((urls) => {
        const validUrls = urls.filter((u): u is string => !!u);
        setImagePreviews((prev) => [...prev, ...validUrls]);
      });
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0) {
      toast.error('Please enter a valid product name and price.');
      return;
    }
    
    // Debug the image preview
    debugImage('Admin - Add Product - Original', imagePreviews[0]);
    
    // Sanitize all previews
    const sanitizedImages = imagePreviews
      .map((u) => sanitizeImageUrl(u))
      .filter((u) => isValidDataUrl(u));

    if (!sanitizedImages.length) {
      toast.error('Please add at least one valid image.');
      return;
    }

    const body = {
      ...newProduct,
      featured,
      images: sanitizedImages,
    };
    
    // Debug the final product
    console.log('Adding new product:', body);
    console.log('Image URLs valid:', sanitizedImages.every(isValidDataUrl));
    
    // Persist to backend API
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('API error');
      await res.json();
      // refresh SWR cache
      mutate();
      toast.success('Product added successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save product.');
    }

    // local UI update
    setShowAddModal(false);
    setNewProduct({ name: '', price: 0, category: '', inStock: true, rating: 0 });
    setImagePreviews([]);
    setFeatured(false);

    // done
  };

  const clearAllProducts = async () => {
    try {
      await Promise.all(products.map(p => fetch(`/api/products/${p.id}`, { method: 'DELETE' })));
      mutate([]);
      setProducts([]);
      toast.success('All products cleared!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear');
    }
  };
  
  // Reset to default products
  const resetToDefaultProducts = () => {
    // Create a red dot image as base64
    const redDotBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    
    // Define default products with test images
    const defaultProducts = [
      {
        id: 1,
        name: 'Test Product with Data URL Image',
        price: 9.99,
        image: redDotBase64,
        category: 'toys-games',
        rating: 5,
        description: 'This is a test product with a red square image. If you can see a red square, the image pipeline works!',
        inStock: true,
        createdAt: new Date().toISOString().slice(0, 10)
      },
      {
        id: 2,
        name: 'Modern Wall Art Canvas',
        price: 89.99,
        image: '/placeholder.svg',
        category: 'decor',
        rating: 4.6,
        description: 'Contemporary canvas art to transform your space',
        inStock: true,
        createdAt: new Date().toISOString().slice(0, 10)
      },
      {
        id: 3,
        name: 'Smart Kitchen Organizer',
        price: 45.99,
        image: '/placeholder.svg',
        category: 'home',
        rating: 4.7,
        description: 'Revolutionary kitchen storage solution',
        inStock: true,
        createdAt: new Date().toISOString().slice(0, 10)
      }
    ];
    
    // Update state and localStorage
    setProducts(defaultProducts);
    mutate(defaultProducts);
    toast.success('Reset to default products with test images!');
  };

  useEffect(() => {
    if (lowStockProducts > 0) {
      toast('Some products are low in stock!', { icon: '⚠️', style: { background: '#fffbe6', color: '#b45309' } });
    }
  }, [lowStockProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">WonderWorks Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                View Store
              </Link>
              <button className="text-gray-700 hover:text-gray-900">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard' },
              { id: 'products', name: 'Products' },
              { id: 'orders', name: 'Orders' },
              { id: 'users', name: 'Users' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <AnalyticsDashboard />
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Products</h2>
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Product
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  onClick={resetToDefaultProducts}
                >
                  Reset to Default
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  onClick={clearAllProducts}
                >
                  Clear All
                </button>
              </div>
            </div>
            {/* Add Product Modal */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowAddModal(false)}
                  >
                    &times;
                  </button>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Add New Product</h3>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Name</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 placeholder-gray-500 text-gray-900"
                        value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Price (EGP)</label>
                      <input
                        type="number"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 placeholder-gray-500 text-gray-900"
                        value={newProduct.price === 0 ? '' : newProduct.price}
                        min={0}
                        step={0.01}
                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                        required
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Category</label>
                      <select
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900"
                        value={newProduct.category}
                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="Toys & Games">Toys & Games</option>
                        <option value="Decor">Decor</option>
                        <option value="Household">Household</option>
                        <option value="Pet Care">Pet Care</option>
                        <option value="Stationary">Stationary</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center text-gray-900">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={newProduct.inStock}
                          onChange={e => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                        />
                        In Stock
                      </label>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Rating</label>
                        <input
                          type="number"
                          className="mt-1 block w-20 border border-gray-300 rounded-md p-2 placeholder-gray-500 text-gray-900"
                          value={newProduct.rating === 0 ? '' : newProduct.rating}
                          min={0}
                          max={5}
                          step={0.1}
                          onChange={e => setNewProduct({ ...newProduct, rating: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                          required
                          placeholder="0-5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Image</label>
                      <input
                        type="file"
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        accept="image/*"
                        onChange={handleImageChange}
                        multiple
                      />
                      {imagePreviews.length > 0 && (
                        <div className="mt-2">
                          {imagePreviews.map((preview, index) => (
                            <Image
                              key={index}
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              width={96}
                              height={96}
                              unoptimized
                              className="object-cover rounded border mr-2 mb-2"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center text-gray-900">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={featured}
                          onChange={e => setFeatured(e.target.checked)}
                        />
                        Featured
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4"
                    >
                      Add Product
                    </button>
                  </form>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            {isValidDataUrl(product.image) ? (
                              <Image
                                src={product.image ?? '/placeholder.svg'}
                                alt={product.name}
                                width={40}
                                height={40}
                                unoptimized
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                onError={() => console.error(`Error loading image for product ${product.id}`)}
                                onClick={() => {
                                  debugImage(`Product ${product.id} - Admin Table`, product.image);
                                  console.log(`Product ${product.id} image URL:`, product.image);
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                            ) : (
                              <div 
                                className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"
                                onClick={() => {
                                  debugImage(`Product ${product.id} - Admin Table (Invalid)`, product.image);
                                  console.log(`Product ${product.id} invalid image URL:`, product.image);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <span className="text-xs text-gray-500">No img</span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price.toFixed(2)} EGP
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ⭐ {product.rating}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-green-600 hover:text-green-900 mr-3"
                          onClick={() => {
                            debugImage(`Product ${product.id} - Debug`, product.image);
                            const sanitized = sanitizeImageUrl(product.image);
                            debugImage(`Product ${product.id} - Sanitized`, sanitized);
                            console.log(`Product ${product.id} full details:`, product);
                            toast.success(`Debugging product ${product.id} - check console`);
                          }}
                        >
                          Debug
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={async () => {
                            try {
                              await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
                              mutate();
                              toast.success('Product deleted successfully!');
                            } catch (err) {
                              console.error(err);
                              toast.error('Failed to delete');
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items.map(item => item.name).join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.total.toFixed(2)} EGP
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-green-600 hover:text-green-900">Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UserManagement />
        )}
      </div>
    </div>
  );
} 