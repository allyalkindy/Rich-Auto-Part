'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Package, Tag, Layers, Hash, DollarSign, AlertTriangle, XCircle, PlusCircle } from 'lucide-react';

interface Product {
  _id: string;
  productName: string;
  category: string;
  quantity: number;
  pricePerUnit: number;
  minimumStock: number;
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');
  return response.json();
}

async function createProduct(data: any): Promise<Product> {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    quantity: '',
    pricePerUnit: '',
    minimumStock: '',
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [restockAmount, setRestockAmount] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  // Set formData to selected product's info when opening modal
  useEffect(() => {
    if (showModal && selectedProduct) {
      setFormData({
        productName: selectedProduct.productName,
        category: selectedProduct.category,
        quantity: selectedProduct.quantity.toString(),
        pricePerUnit: selectedProduct.pricePerUnit.toString(),
        minimumStock: selectedProduct.minimumStock.toString(),
      });
    }
  }, [showModal, selectedProduct]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setFormData({
        productName: '',
        category: '',
        quantity: '',
        pricePerUnit: '',
        minimumStock: '',
      });
    },
  });

  // Helper to update product in local state after restock
  function updateProductInList(productId: string, newQuantity: number) {
    if (!products) return;
    const updated = products.map(p =>
      p._id === productId ? { ...p, quantity: newQuantity } : p
    );
    queryClient.setQueryData(['products'], updated);
    if (selectedProduct && selectedProduct._id === productId) {
      setSelectedProduct({ ...selectedProduct, quantity: newQuantity });
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      quantity: formData.quantity === '' ? 0 : Number(formData.quantity),
      pricePerUnit: formData.pricePerUnit === '' ? 0 : Number(formData.pricePerUnit),
      minimumStock: formData.minimumStock === '' ? 0 : Number(formData.minimumStock),
    });
  };

  async function handleDeleteProduct(productId: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setIsDeleting(true);
    await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    setIsDeleting(false);
    setShowModal(false);
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }

  async function handleRestockProduct(productId: string, amount: number) {
    setIsRestocking(true);
    const res = await fetch(`/api/products/${productId}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (res.ok) {
      const updated = await res.json();
      updateProductInList(productId, updated.quantity);
    }
    setIsRestocking(false);
    setRestockAmount('');
  }

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 font-heading">Products</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>

          {showForm && (
            <div className="bg-white/90 p-8 rounded-2xl shadow-2xl mb-6 max-w-2xl mx-auto border border-primary-100">
              <h2 className="text-2xl font-bold mb-6 text-primary-700 flex items-center gap-2">
                <Plus className="w-6 h-6 text-primary-600" /> Add New Product
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">
                    <Tag className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm text-gray-900"
                    required
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">
                    <Layers className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Category (e.g. Engine, Brake, etc.)"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm text-gray-900"
                    required
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">
                    <Hash className="w-5 h-5" />
                  </span>
                  <input
                    type="number"
                    placeholder="Quantity (e.g. 10)"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value.replace(/[^\d]/g, '') })}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm text-gray-900"
                    min="0"
                    required
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">
                    <DollarSign className="w-5 h-5" />
                  </span>
                  <input
                    type="number"
                    placeholder="Price per Unit (e.g. 99.99)"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value.replace(/[^\d.]/g, '') })}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm text-gray-900"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="relative md:col-span-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">
                    <AlertTriangle className="w-5 h-5" />
                  </span>
                  <input
                    type="number"
                    placeholder="Minimum Stock (e.g. 5)"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value.replace(/[^\d]/g, '') })}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm text-gray-900"
                    min="0"
                    required
                  />
                </div>
                <div className="flex space-x-2 md:col-span-2 justify-end">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-md transition-all"
                  >
                    {createMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 shadow-md transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 placeholder-gray-400 text-base transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {isLoading ? (
            <div>Loading products...</div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(products?.filter(product => {
                    const s = searchText.toLowerCase();
                    if (!s) return true;
                    return (
                      product.productName.toLowerCase().includes(s) ||
                      product.category.toLowerCase().includes(s) ||
                      product.quantity.toString().includes(s) ||
                      product.pricePerUnit.toString().includes(s) ||
                      product.minimumStock.toString().includes(s)
                    );
                  }) || []).map((product) => (
                    <tr key={product._id} onClick={() => { setSelectedProduct(product); setShowModal(true); }} className="cursor-pointer hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          product.quantity <= product.minimumStock ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-numbers">
                        Tshs {product.pricePerUnit.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.minimumStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {showModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg mx-4 sm:mx-0 bg-white rounded-3xl shadow-2xl p-0 overflow-hidden animate-modal-pop">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-primary-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Edit Product</h2>
              </div>
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-primary-600 focus:outline-none"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <XCircle className="w-7 h-7" />
              </button>
            </div>
            {/* Editable Form */}
            <form className="px-6 py-8 space-y-6 bg-white" onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedProduct) return;
              setIsRestocking(true);
              await fetch(`/api/products/${selectedProduct._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productName: formData.productName,
                  category: formData.category,
                  quantity: formData.quantity === '' ? 0 : Number(formData.quantity),
                  pricePerUnit: formData.pricePerUnit === '' ? 0 : Number(formData.pricePerUnit),
                  minimumStock: formData.minimumStock === '' ? 0 : Number(formData.minimumStock),
                }),
              });
              setIsRestocking(false);
              setShowModal(false);
              queryClient.invalidateQueries({ queryKey: ['products'] });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 shadow-sm bg-gray-50"
                    value={formData.productName}
                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 shadow-sm bg-gray-50"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 shadow-sm bg-gray-50"
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value.replace(/[^\d]/g, '') })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price per Unit</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 shadow-sm bg-gray-50"
                      value={formData.pricePerUnit}
                      onChange={e => setFormData({ ...formData, pricePerUnit: e.target.value.replace(/[^\d.]/g, '') })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Minimum Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 shadow-sm bg-gray-50"
                    value={formData.minimumStock}
                    onChange={e => setFormData({ ...formData, minimumStock: e.target.value.replace(/[^\d]/g, '') })}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition-all shadow ${isDeleting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => { setPendingDeleteId(selectedProduct._id); setShowDeleteModal(true); }}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-5 h-5" /> {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="submit"
                  className={`flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow ${isRestocking ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={isRestocking}
                >
                  <Edit className="w-5 h-5" /> {isRestocking ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative animate-modal-pop">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
            </div>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all"
                onClick={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
                onClick={async () => {
                  if (pendingDeleteId) {
                    setIsDeleting(true);
                    await fetch(`/api/products/${pendingDeleteId}`, { method: 'DELETE' });
                    setIsDeleting(false);
                    setShowModal(false);
                    setShowDeleteModal(false);
                    setPendingDeleteId(null);
                    queryClient.invalidateQueries({ queryKey: ['products'] });
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Navigation>
  );
}
