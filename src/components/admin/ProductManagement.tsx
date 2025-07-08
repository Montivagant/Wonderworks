import { useState, useMemo, useEffect, useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  Package,
  DollarSign,
  Tag
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: number;
  category?: Category;
  image?: string;
  featured: boolean;
  archived: boolean;
  originalPrice?: number;
  isFlashDeal: boolean;
  isRecommended: boolean;
  flashDealEndTime?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductManagement() {
  const [showArchived, setShowArchived] = useState(false);
  const { data: products, mutate } = useSWR<Product[]>(`/api/admin/products${showArchived ? '?archived=true' : ''}`, fetcher);
  const { data: categories } = useSWR<Category[]>('/api/admin/categories', fetcher);
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteBlocked, setDeleteBlocked] = useState<{blocked: boolean, reason?: string, product?: Product} | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showNoCategoryModal, setShowNoCategoryModal] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    images: [],
    featured: false,
    isFlashDeal: false,
    isRecommended: false,
    flashDealEndTime: '',
    originalPrice: ''
  });

  // Add state for form errors
  const [formErrors, setFormErrors] = useState({});

  // Validation function
  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Product name is required.';
    if (!form.category) errors.category = 'Category is required.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errors.price = 'Price must be a positive number.';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) errors.stock = 'Stock must be zero or a positive number.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const filtered = (products || []).filter(prod =>
    prod.name.toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter === '' || prod.categoryId === categoryFilter)
  );

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      images: [],
      featured: false,
      isFlashDeal: false,
      isRecommended: false,
      flashDealEndTime: '',
      originalPrice: ''
    });
  };

  const handleCreate = () => {
    setCreating(true);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditing(product.id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price !== undefined && product.price !== null ? product.price.toString() : '',
      stock: product.stock !== undefined && product.stock !== null ? product.stock.toString() : '',
      category: product.categoryId !== undefined && product.categoryId !== null ? product.categoryId.toString() : '',
      images: product.image ? [product.image] : [],
      featured: !!product.featured,
      isFlashDeal: !!product.isFlashDeal,
      isRecommended: !!product.isRecommended,
      flashDealEndTime: product.flashDealEndTime ? product.flashDealEndTime.slice(0, 16) : '',
      originalPrice: product.originalPrice !== undefined && product.originalPrice !== null ? product.originalPrice.toString() : ''
    });
  };

  const handleCancel = () => {
    setCreating(false);
    setEditing(null);
    resetForm();
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageUploading(true);
    try {
      // Convert each file to a data URL
      const urls = await Promise.all(files.map(file => processImageFile(file)));
      setForm(prev => ({ ...prev, images: [...prev.images, ...urls].slice(0, 5) }));
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setImageUploading(false);
    }
  };

  // Update handleSubmit to use validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const url = '/api/admin/products';
      const method = editing ? 'PUT' : 'POST';
      
      // Prepare the data to send to API
      const productData = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        image: form.images.length > 0 ? form.images[0] : '',
        images: form.images,
        featured: form.featured,
        categoryId: form.category as number,
        isFlashDeal: form.isFlashDeal,
        isRecommended: form.isRecommended,
        flashDealEndTime: form.flashDealEndTime ? new Date(form.flashDealEndTime).toISOString() : null,
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      };

      const payload = editing ? { id: editing, ...productData } : productData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editing ? 'Product updated successfully' : 'Product created successfully');
        mutate();
        globalMutate('/api/products');
        globalMutate('/api/categories');
        handleCancel();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.details || errorData.message || 'Failed to save product');
      }
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleting.id })
      });
      if (response.ok) {
        toast.success('Product deleted successfully');
        mutate();
        globalMutate('/api/products');
        globalMutate('/api/categories');
        setDeleting(null);
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          setDeleteBlocked({ blocked: true, reason: errorData.error, product: deleting });
          setDeleting(null);
        } else {
          toast.error(errorData.error || errorData.details || errorData.message || 'Failed to delete product');
        }
      }
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // Memoized list of visible product IDs
  const visibleProductIds = useMemo(() => filtered.map(p => p.id), [filtered]);

  const allSelected = selectedProducts.length > 0 && visibleProductIds.every(id => selectedProducts.includes(id));
  const someSelected = selectedProducts.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(visibleProductIds);
    }
  };

  const toggleSelectProduct = (id: number) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  const clearSelection = () => setSelectedProducts([]);

  const handleBulkAction = async (action: 'delete' | 'feature' | 'unfeature') => {
    if (selectedProducts.length === 0) return;
    setLoading(true);
    try {
      const url = '/api/admin/products/bulk';
      const method = 'POST';
      const body: any = { ids: selectedProducts, action };
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        toast.success(`Bulk ${action} successful`);
        mutate();
        globalMutate('/api/products');
        globalMutate('/api/categories');
        clearSelection();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.details || errorData.message || `Bulk ${action} failed`);
      }
    } catch (error) {
      toast.error(`Bulk ${action} failed`);
    } finally {
      setLoading(false);
    }
  };

  const noCategories = !categories || categories.length === 0;

  useEffect(() => {
    if (creating && noCategories) {
      setShowNoCategoryModal(true);
    }
  }, [creating, noCategories]);

  const closeNoCategoryModal = useCallback(() => {
    setShowNoCategoryModal(false);
    setCreating(false);
  }, []);

  useEffect(() => {
    if (!showNoCategoryModal) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNoCategoryModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showNoCategoryModal, closeNoCategoryModal]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Product Management</h1>
          <p className="text-neutral-600 mt-1">Manage your product catalog and inventory</p>
        </div>
        <Button
          onClick={handleCreate}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <select
              value={categoryFilter}
              onChange={(e) => {
                const val = e.target.value;
                setCategoryFilter(val === '' ? '' : Number(val));
              }}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900"
            >
              <option value="">All Categories</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')} disabled={selectedProducts.length === 0 || loading}>
                <Trash2 className="w-4 h-4 mr-2" />
                Bulk Delete
                {selectedProducts.length > 0 && (
                  <span className="ml-2 text-xs text-neutral-500">({selectedProducts.length})</span>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('feature')} disabled={selectedProducts.length === 0 || loading}>
                <Star className="w-4 h-4 mr-2" />
                Bulk Feature
                {selectedProducts.length > 0 && (
                  <span className="ml-2 text-xs text-neutral-500">({selectedProducts.length})</span>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={e => setShowArchived(e.target.checked)}
                id="show-archived"
                className="accent-primary-600"
              />
              <label htmlFor="show-archived" className="text-sm font-medium text-neutral-900">
                Show Archived
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Products ({filtered.length})</h2>
            <Badge variant="primary">{products?.length || 0} total</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = someSelected; }}
                      onChange={toggleSelectAll}
                      aria-label="Select all products"
                      className="accent-primary-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filtered.map(prod => (
                  <motion.tr 
                    key={prod.id} 
                    className="hover:bg-neutral-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(prod.id)}
                        onChange={() => toggleSelectProduct(prod.id)}
                        aria-label={`Select product ${prod.name}`}
                        className="accent-primary-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mr-4">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <Package className="w-6 h-6 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{prod.name}</div>
                          <div className="text-sm text-neutral-500">{prod.description?.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      <Badge variant="neutral" size="sm">{categories?.find(c=>c.id===prod.categoryId)?.name ?? '—'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 font-medium">
                      {prod.price.toFixed(2)} EGP
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      <span className={prod.stock > 10 ? 'text-success-600' : prod.stock > 0 ? 'text-warning-600' : 'text-error-600'}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {prod.archived ? (
                        <Badge variant="neutral" size="sm">Archived</Badge>
                      ) : prod.featured ? (
                        <Badge variant="primary" size="sm">Featured</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Standard</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(prod)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!prod.archived ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              setLoading(true);
                              await fetch('/api/admin/products', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  ...prod,
                                  archived: true
                                })
                              });
                              toast.success('Product archived');
                              mutate();
                              globalMutate('/api/products');
                              globalMutate('/api/categories');
                              setLoading(false);
                            }}
                            className="text-warning-600 hover:text-warning-700"
                          >
                            Archive
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              setLoading(true);
                              await fetch('/api/admin/products', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  ...prod,
                                  archived: false
                                })
                              });
                              toast.success('Product unarchived');
                              mutate();
                              globalMutate('/api/products');
                              globalMutate('/api/categories');
                              setLoading(false);
                            }}
                            className="text-success-600 hover:text-success-700"
                          >
                            Unarchive
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleting(prod)}
                          className="text-error-600 hover:text-error-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                      <div className="flex flex-col items-center">
                        <Package className="w-12 h-12 text-neutral-300 mb-4" />
                        <p className="text-lg font-medium text-neutral-700">No products found</p>
                        <p className="text-sm text-neutral-500">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(creating || editing) && !showNoCategoryModal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">
                {editing ? 'Edit Product' : 'New Product'}
              </h2>
            </CardHeader>
            <CardContent>
              {noCategories ? (
                <div className="text-center text-error-600 font-medium p-6">
                  No categories found. Please create a category before adding a product.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label={<span>Product Name <span className="text-error-600">*</span></span>}
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      leftIcon={<Package className="w-4 h-4" />}
                      error={formErrors.name}
                    />
                    <div>
                      <label className="block text-sm font-medium text-neutral-900 mb-1">
                        Category <span className="text-error-600">*</span>
                      </label>
                      <select
                        value={form.category}
                        onChange={e => {
                          const val = e.target.value;
                          setForm(prev => ({ ...prev, category: val === '' ? '' : Number(val) }));
                        }}
                        required
                        className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        <option value="">Select Category</option>
                        {categories?.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      {formErrors.category && <p className="mt-1 text-sm text-error-600">{formErrors.category}</p>}
                    </div>
                    <Input
                      label={<span>Price <span className="text-error-600">*</span></span>}
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                      required
                      leftIcon={<DollarSign className="w-4 h-4" />}
                      error={formErrors.price}
                    />
                    <Input
                      label="Original Price (for Flash Deal)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.originalPrice}
                      onChange={e => setForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                    />
                    <Input
                      label={<span>Stock <span className="text-error-600">*</span></span>}
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm(prev => ({ ...prev, stock: e.target.value }))}
                      required
                      error={formErrors.stock}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">Product Images</label>
                    <div className="flex flex-wrap gap-4 items-center">
                      {form.images.map((img, idx) => (
                        <div key={idx} className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center relative">
                          <img src={img} alt={`Product ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                          <button type="button" className="absolute top-1 right-1 bg-white rounded-full p-1 shadow" onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}>
                            &times;
                          </button>
                        </div>
                      ))}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesUpload}
                        className="hidden"
                        id="images-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('images-upload')?.click()}
                        loading={imageUploading}
                        className="mt-2"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Images
                      </Button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Recommended: 800x800px, JPG/PNG, under 1MB each. You can upload up to 5 images.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900"
                      placeholder="Product description..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                      id="featured"
                      className="accent-primary-600"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-neutral-900">
                      Featured Product
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.isFlashDeal}
                        onChange={e => setForm(prev => ({ ...prev, isFlashDeal: e.target.checked }))}
                        className="accent-primary-600"
                      />
                      Flash Deal
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.isRecommended}
                        onChange={e => setForm(prev => ({ ...prev, isRecommended: e.target.checked }))}
                        className="accent-primary-600"
                      />
                      Recommended
                    </label>
                  </div>
                  {form.isFlashDeal && (
                    <Input
                      label="Flash Deal End Time"
                      type="datetime-local"
                      value={form.flashDealEndTime}
                      onChange={e => setForm(prev => ({ ...prev, flashDealEndTime: e.target.value }))}
                    />
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                    >
                      {editing ? 'Update Product' : 'Create Product'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <h3 className="text-lg font-semibold text-neutral-900">Delete Product</h3>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-6">
                Are you sure you want to delete <span className="font-bold">{deleting.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleting(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  loading={loading}
                >
                  Delete Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Blocked Modal */}
      {deleteBlocked && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <h3 className="text-lg font-semibold text-neutral-900">Cannot Delete Product</h3>
            </CardHeader>
            <CardContent>
              <p className="text-error-700 mb-4 font-medium">{deleteBlocked.reason || 'This product cannot be deleted because it has been ordered.'}</p>
              <div className="flex flex-col gap-3 mb-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Mark as out of stock
                    if (!deleteBlocked.product) return;
                    setLoading(true);
                    fetch('/api/admin/products', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: deleteBlocked.product.id,
                        name: deleteBlocked.product.name,
                        description: deleteBlocked.product.description,
                        price: deleteBlocked.product.price,
                        stock: 0,
                        featured: false,
                        categoryId: deleteBlocked.product.categoryId,
                        isFlashDeal: false,
                        isRecommended: false,
                        flashDealEndTime: null,
                        originalPrice: null
                      })
                    }).then(() => {
                      toast.success('Product marked as out of stock');
                      mutate();
                      globalMutate('/api/products');
                      globalMutate('/api/categories');
                      setDeleteBlocked(null);
                      setLoading(false);
                    });
                  }}
                  loading={loading}
                >
                  Mark as Out of Stock
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Archive (set featured: false, inStock: false)
                    if (!deleteBlocked.product) return;
                    setLoading(true);
                    fetch('/api/admin/products', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: deleteBlocked.product.id,
                        name: deleteBlocked.product.name,
                        description: deleteBlocked.product.description,
                        price: deleteBlocked.product.price,
                        stock: 0,
                        featured: false,
                        categoryId: deleteBlocked.product.categoryId,
                        isFlashDeal: false,
                        isRecommended: false,
                        flashDealEndTime: null,
                        originalPrice: null
                      })
                    }).then(() => {
                      toast.success('Product archived');
                      mutate();
                      globalMutate('/api/products');
                      globalMutate('/api/categories');
                      setDeleteBlocked(null);
                      setLoading(false);
                    });
                  }}
                  loading={loading}
                >
                  Archive Product
                </Button>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteBlocked(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showNoCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
            <p className="text-lg font-semibold text-error-600 mb-4">No categories found. Please create a category before adding a product.</p>
            <Button onClick={closeNoCategoryModal} className="mt-2 w-full">Okay</Button>
          </div>
        </div>
      )}
    </div>
  );
} 