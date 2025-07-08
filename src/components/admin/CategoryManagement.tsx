import { useState, useMemo } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FolderOpen,
  Tag
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function CategoryManagement() {
  const { data: categories, mutate } = useSWR<Category[]>('/api/admin/categories', fetcher);
  
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    description: ''
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filtered = (categories || []).filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const visibleCategoryIds = useMemo(() => filtered.map(c => c.id), [filtered]);
  const allSelected = selectedCategories.length > 0 && visibleCategoryIds.every(id => selectedCategories.includes(id));
  const someSelected = selectedCategories.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(visibleCategoryIds);
    }
  };

  const toggleSelectCategory = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };

  const clearSelection = () => setSelectedCategories([]);

  const handleBulkAction = async () => {
    if (selectedCategories.length === 0) return;
    setLoading(true);
    try {
      const url = '/api/admin/categories/bulk';
      const method = 'POST';
      const body: any = { ids: selectedCategories, action: 'delete' };
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        toast.success('Bulk delete successful');
        mutate();
        clearSelection();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.details || errorData.message || 'Bulk delete failed');
      }
    } catch (error) {
      toast.error('Bulk delete failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: ''
    });
  };

  const handleCreate = () => {
    setCreating(true);
    resetForm();
  };

  const handleEdit = (category: Category) => {
    setEditing(category.id);
    setForm({
      name: category.name,
      description: category.description || ''
    });
  };

  const handleCancel = () => {
    setCreating(false);
    setEditing(null);
    resetForm();
  };

  // util to create slug from name
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
      .replace(/\s+/g, '-')          // collapse whitespace
      .replace(/-+/g, '-');           // collapse dashes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = '/api/admin/categories';
      const method = editing ? 'PUT' : 'POST';
      
      const payload = editing
        ? { id: editing, name: form.name, slug: slugify(form.name), description: form.description }
        : { name: form.name, slug: slugify(form.name), description: form.description };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editing ? 'Category updated successfully' : 'Category created successfully');
        mutate();
        handleCancel();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.message || errorData.details || 'Failed to save category');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleting.id })
      });

      if (response.ok) {
        toast.success('Category deleted successfully');
        mutate();
        setDeleting(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.message || 'Failed to delete category');
      }
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Category Management</h1>
          <p className="text-neutral-600 mt-1">Organize your products with categories</p>
        </div>
        <Button
          onClick={handleCreate}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Categories ({filtered.length})</h2>
            <Badge variant="primary">{categories?.length || 0} total</Badge>
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
                      aria-label="Select all categories"
                      className="accent-primary-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-100">
                {filtered.map(cat => (
                  <motion.tr 
                    key={cat.id} 
                    className="hover:bg-neutral-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleSelectCategory(cat.id)}
                        aria-label={`Select category ${cat.name}`}
                        className="accent-primary-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FolderOpen className="w-5 h-5 text-neutral-400 mr-3" />
                        <span className="text-sm font-medium text-neutral-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      <Badge variant="neutral" size="sm">{cat.slug}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {cat.description || 'No description'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(cat)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleting(cat)}
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
                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                      <div className="flex flex-col items-center">
                        <FolderOpen className="w-12 h-12 text-neutral-300 mb-4" />
                        <p className="text-lg font-medium text-neutral-700">No categories found</p>
                        <p className="text-sm text-neutral-500">Try adjusting your search or create a new category</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedCategories.length > 0 && (
        <div className="bg-neutral-50 px-4 py-3 flex items-center justify-between border-t border-neutral-200 sm:px-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkAction}
              disabled={selectedCategories.length === 0 || loading}
            >
              Bulk Delete
              {selectedCategories.length > 0 && (
                <span className="ml-2 text-xs text-neutral-500">({selectedCategories.length})</span>
              )}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
            className="text-neutral-600 hover:text-neutral-900"
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <Card className="max-w-md w-full">
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">
                {editing ? 'Edit Category' : 'New Category'}
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Category Name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  leftIcon={<Tag className="w-4 h-4" />}
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-900"
                    placeholder="Category description..."
                  />
                </div>
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
                    {editing ? 'Update Category' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <h3 className="text-lg font-semibold text-neutral-900">Delete Category</h3>
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
                  Delete Category
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 