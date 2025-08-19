'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Search, X } from 'lucide-react';
import Loader from '@/components/ui/Loader';

interface Product {
  _id: string;
  productName: string;
  category: string;
  type?: string;
  quantity: number;
  pricePerUnit: number;
}

interface Sale {
  _id: string;
  productId: string;
  productName: string;
  quantitySold: number;
  salePrice: number;
  date: string;
  staffName: string;
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');
  return response.json();
}

async function fetchSales(): Promise<Sale[]> {
  const response = await fetch('/api/sales');
  return response.json();
}

async function createSale(data: { productId: string; quantitySold: number; sellingPricePerUnit: number }): Promise<Sale> {
  const response = await fetch('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export default function SalesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantitySold, setQuantitySold] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState(0);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: fetchSales,
  });

  const createSaleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedProduct('');
      setQuantitySold(1);
      setSearchTerm('');
      setShowSearchResults(false);
      setSellingPricePerUnit(0);
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && quantitySold > 0) {
      const finalPricePerUnit = sellingPricePerUnit > 0 ? sellingPricePerUnit : selectedProductData?.pricePerUnit || 0;
      createSaleMutation.mutate({
        productId: selectedProduct,
        quantitySold,
        sellingPricePerUnit: finalPricePerUnit,
      });
    }
  };

  const filteredProducts = products?.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.type ? product.type.toLowerCase().includes(searchTerm.toLowerCase()) : false)
  ) || [];

  const selectedProductData = products?.find(p => p._id === selectedProduct);

  // Update selling price when product changes
  useEffect(() => {
    if (selectedProductData) {
      setSellingPricePerUnit(selectedProductData.pricePerUnit);
    }
  }, [selectedProductData]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product._id);
    setSearchTerm(product.productName);
    setSellingPricePerUnit(product.pricePerUnit); // Set default price
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSearchResults(false);
  };

  if (status === 'loading') {
    return <Loader fullScreen message="Loading sales..." />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Record Sales</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                New Sale
              </h2>
              

              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Products
                  </label>
                  {!products || products.length === 0 ? (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-gray-600 text-sm mb-2">
                        {!products ? 'Unable to load products. Please log in first.' : 'No products available.'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        To use the search functionality:
                      </p>
                      <ul className="text-gray-500 text-xs mt-1 ml-4 list-disc">
                        <li>Make sure you are logged in</li>
                        <li>Add some products to the database first</li>
                        <li>Then you can search and select products</li>
                      </ul>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600 w-5 h-5 font-bold" />
                        <input
                          type="text"
                          placeholder="Search by name or category..."
                          value={searchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSearchTerm(value);
                            setShowSearchResults(value.length > 0);
                          }}
                          onFocus={() => {
                            setShowSearchResults(searchTerm.length > 0);
                          }}
                          className="pl-10 pr-10 border border-gray-300 rounded-md w-full focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder-gray-500 placeholder:font-bold bg-white py-3"
                        />
                        {searchTerm && (
                          <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Search Results Dropdown */}
                      {showSearchResults && searchTerm && (
                        <div className="relative z-50 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredProducts.length > 0 ? (
                            <div className="py-1">
                              {filteredProducts.map((product) => (
                                <button
                                  key={product._id}
                                  type="button"
                                  onClick={() => handleProductSelect(product)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{product.productName}</div>
                                  <div className="text-sm text-gray-500">
                                    {product.category}{product.type ? ` • ${product.type}` : ''} • Stock: {product.quantity} • Tshs. {product.pricePerUnit.toFixed(2)}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">
                              No products found matching "{searchTerm}"
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Product
                  </label>
                  {selectedProductData ? (
                    <div className="bg-green-50 p-4 rounded-md border border-green-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-green-900">{selectedProductData.productName}</h3>
                          <p className="text-sm text-green-700">{selectedProductData.category}{selectedProductData.type ? ` • ${selectedProductData.type}` : ''}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct('');
                            setSearchTerm('');
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm py-2">
                      Search and select a product above
                    </div>
                  )}
                </div>

                {selectedProductData && (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Product Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 font-medium text-gray-900">{selectedProductData.productName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="ml-2 font-medium text-gray-900">{selectedProductData.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Available Stock:</span>
                        <span className="ml-2 font-medium text-gray-900">{selectedProductData.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Price per Unit:</span>
                        <span className="ml-2 font-medium text-gray-900">Tshs. {selectedProductData.pricePerUnit.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Sold
                  </label>
                  <input
                    type="number"
                    value={quantitySold}
                    onChange={(e) => setQuantitySold(parseInt(e.target.value) || 0)}
                    min="1"
                    max={selectedProductData?.quantity || 1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    required
                  />
                </div>

                {selectedProductData && quantitySold > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price per Unit
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={sellingPricePerUnit}
                        onChange={(e) => setSellingPricePerUnit(parseFloat(e.target.value) || 0)}
                        min="0.01"
                        step="0.01"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        placeholder={`Default: Tshs. ${selectedProductData.pricePerUnit.toFixed(2)}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setSellingPricePerUnit(selectedProductData.pricePerUnit)}
                        className="px-3 py-2 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md border border-gray-300"
                        title="Reset to default price"
                      >
                        Reset
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Default price: Tshs. {selectedProductData.pricePerUnit.toFixed(2)} | 
                      You can adjust this for negotiations
                    </p>
                  </div>
                )}

                {selectedProductData && quantitySold > 0 && (
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-2">Sale Summary</h3>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Quantity:</span>
                        <span className="text-blue-900 font-medium">{quantitySold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Default Price per Unit:</span>
                        <span className="text-blue-900 font-medium">Tshs. {selectedProductData.pricePerUnit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Selling Price per Unit:</span>
                        <span className="text-blue-900 font-medium">Tshs. {sellingPricePerUnit > 0 ? sellingPricePerUnit.toFixed(2) : selectedProductData.pricePerUnit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-blue-900 border-t border-blue-200 pt-2 mt-2">
                        <span>Total Sale Price:</span>
                        <span>Tshs. {(quantitySold * (sellingPricePerUnit > 0 ? sellingPricePerUnit : selectedProductData.pricePerUnit)).toFixed(2)}</span>
                      </div>
                      {sellingPricePerUnit > 0 && sellingPricePerUnit !== selectedProductData.pricePerUnit && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <span className="text-yellow-700">
                            Price adjusted: {sellingPricePerUnit > selectedProductData.pricePerUnit ? '+' : '-'}Tshs. {Math.abs(sellingPricePerUnit - selectedProductData.pricePerUnit).toFixed(2)} per unit
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedProduct || quantitySold <= 0 || createSaleMutation.isPending}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createSaleMutation.isPending ? 'Recording Sale...' : 'Record Sale'}
                </button>
              </form>
            </div>

            {/* Recent Sales */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
              
              {salesLoading ? (
                <div className="text-gray-500">Loading sales...</div>
              ) : (
                <div className="space-y-4 overflow-x-auto">
                  {sales && sales.length > 0 ? (
                    sales.slice(0, 10).map((sale) => (
                      <div key={sale._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{sale.productName}</h3>
                            <p className="text-sm text-gray-500">
                              {sale.quantitySold} units • Tshs. {sale.salePrice.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(sale.date).toLocaleDateString()} by {sale.staffName}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-green-600">
                              Tshs. {sale.salePrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No sales recorded yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
