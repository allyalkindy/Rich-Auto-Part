'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';

interface LowStockProduct {
  _id: string;
  productName: string;
  category: string;
  quantity: number;
  minimumStock: number;
}

async function fetchLowStockProducts(): Promise<LowStockProduct[]> {
  const response = await fetch('/api/reports/low-stock');
  return response.json();
}

export default function LowStockPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: lowStockProducts, isLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: fetchLowStockProducts,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Low Stock Alerts</h1>
          </div>

          {isLoading ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingDown className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Products Below Minimum Stock
                        </dt>
                        <dd className="text-lg font-medium text-red-600">
                          {lowStockProducts?.length || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Stock Products List */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Products Requiring Restocking
                  </h2>
                </div>
                
                {lowStockProducts && lowStockProducts.length > 0 ? (
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
                            Current Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Minimum Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {lowStockProducts.map((product) => {
                          const stockDifference = product.minimumStock - product.quantity;
                          const isCritical = product.quantity === 0;
                          const isLow = product.quantity > 0 && product.quantity < product.minimumStock;
                          
                          return (
                            <tr key={product._id} className={isCritical ? 'bg-red-50' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Package className="w-5 h-5 text-gray-400 mr-3" />
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.productName}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${
                                  isCritical ? 'text-red-600' : 'text-orange-600'
                                }`}>
                                  {product.quantity}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.minimumStock}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {isCritical ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Out of Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                    Low Stock
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-green-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">All products well stocked</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No products are currently below their minimum stock levels.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Items */}
              {lowStockProducts && lowStockProducts.length > 0 && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">Recommended Actions</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Review products with zero stock immediately and place urgent orders
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Contact suppliers for products below minimum stock levels
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Consider adjusting minimum stock levels for frequently sold items
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Monitor sales patterns to improve inventory forecasting
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Navigation>
  );
}
