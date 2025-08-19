'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useQuery } from '@tanstack/react-query';
import { Calendar, TrendingUp, Package, Users, DollarSign, XCircle, Edit, Trash2 } from 'lucide-react';
import Loader from '@/components/ui/Loader';

interface Sale {
  _id: string;
  productName: string;
  quantitySold: number;
  salePrice: number;
  date: string;
  staffName: string;
}

interface DailyReport {
  totalSales: number;
  totalSalesAmount: number;
  sales: Sale[];
  isFallbackData?: boolean;
}

async function fetchDailyReport(date: string): Promise<DailyReport> {
  const response = await fetch(`/api/reports/daily?date=${date}`);
  return response.json();
}

export default function DailyReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    quantitySold: 0,
    salePrice: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['daily-report', selectedDate],
    queryFn: () => fetchDailyReport(selectedDate),
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSaleClick = (sale: Sale) => {
    setSelectedSale(sale);
    setEditFormData({
      quantitySold: sale.quantitySold,
      salePrice: sale.salePrice,
    });
    setShowModal(true);
  };

  const handleDeleteSale = async () => {
    if (!selectedSale) return;
    setIsDeleting(true);
    await fetch(`/api/sales/${selectedSale._id}`, { method: 'DELETE' });
    setIsDeleting(false);
    setShowModal(false);
    setShowDeleteModal(false);
    refetch();
  };

  const handleUpdateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;
    setIsUpdating(true);
    try {
      await fetch(`/api/sales/${selectedSale._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      setShowModal(false);
      refetch();
    } catch (error) {
      console.error('Error updating sale:', error);
    }
    setIsUpdating(false);
  };

  if (status === 'loading') {
    return <Loader fullScreen message="Loading daily report..." />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center mb-6">
            <Calendar className="w-8 h-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 font-heading">Daily Sales Report</h1>
          </div>

          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {isLoading ? (
            <div>Loading report...</div>
          ) : report ? (
            <>
              {report.isFallbackData && (
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800">
                    <strong>Note:</strong> No sales found for {selectedDate}. Showing recent sales from all dates instead.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900">{report.totalSales}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Tshs. {report.totalSalesAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Sale</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Tshs. {report.totalSales > 0 ? (report.totalSalesAmount / report.totalSales).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Sales Details</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Staff
                        </th>
                        <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.sales.map((sale) => (
                        <tr 
                          key={sale._id} 
                          onClick={() => handleSaleClick(sale)}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-normal sm:whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[140px] sm:max-w-none">
                            {sale.productName}
                          </td>
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {sale.quantitySold}
                          </td>
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            Tshs. {sale.salePrice.toFixed(2)}
                          </td>
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {sale.staffName}
                          </td>
                          <td className="px-2 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {new Date(sale.date).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No sales data available for the selected date.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sales Edit Modal */}
      {showModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in">
          <div className="relative w-full max-w-lg mx-4 sm:mx-0 bg-white rounded-3xl shadow-2xl p-0 max-h-[90vh] overflow-y-auto animate-modal-pop">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-primary-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Edit Sale</h2>
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
            <form className="px-6 py-8 space-y-6 bg-white" onSubmit={handleUpdateSale}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                  <div className="text-gray-900 font-medium">{selectedSale.productName}</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <div className="text-gray-900 font-medium">{new Date(selectedSale.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Staff</label>
                  <div className="text-gray-900 font-medium">{selectedSale.staffName}</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity Sold</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 shadow-sm"
                    value={editFormData.quantitySold}
                    onChange={e => setEditFormData({ ...editFormData, quantitySold: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sale Price</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 shadow-sm"
                    value={editFormData.salePrice}
                    onChange={e => setEditFormData({ ...editFormData, salePrice: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition-all shadow ${isDeleting ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-5 h-5" /> {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="submit"
                  className={`flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={isUpdating}
                >
                  <Edit className="w-5 h-5" /> {isUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative animate-modal-pop mx-4 sm:mx-0">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
            </div>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this sale? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
                onClick={handleDeleteSale}
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
