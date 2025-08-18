'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Calendar, DollarSign, Package } from 'lucide-react';

interface YearlyReport {
  totalSalesAmount: number;
  totalProductsSold: number;
  monthlyBreakdown: Array<{
    month: string;
    totalSales: number;
    totalQuantity: number;
  }>;
  year: number;
}

async function fetchYearlyReport(year: number): Promise<YearlyReport> {
  const response = await fetch(`/api/reports/yearly?year=${year}`);
  return response.json();
}

export default function YearlyReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: report, isLoading } = useQuery({
    queryKey: ['yearly-report', selectedYear],
    queryFn: () => fetchYearlyReport(selectedYear),
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && session?.user?.role === 'staff') {
      router.push('/reports/daily');
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 font-heading">Yearly Sales Report</h1>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <DollarSign className="h-6 w-6 text-green-400" />
                      <div className="ml-5">
                        <dt className="text-sm font-medium text-gray-500">Total Sales Amount</dt>
                        <dd className="text-lg font-medium text-gray-900 font-numbers">
                          Tshs. {report?.totalSalesAmount?.toFixed(2) || '0.00'}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <Package className="h-6 w-6 text-blue-400" />
                      <div className="ml-5">
                        <dt className="text-sm font-medium text-gray-500">Total Products Sold</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {report?.totalProductsSold || 0}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <BarChart3 className="h-6 w-6 text-purple-400" />
                      <div className="ml-5">
                        <dt className="text-sm font-medium text-gray-500">Average Monthly Sales</dt>
                        <dd className="text-lg font-medium text-gray-900 font-numbers">
                          Tshs. {report?.totalSalesAmount ? (report.totalSalesAmount / 12).toFixed(2) : '0.00'}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Monthly Breakdown for {report?.year}
                  </h2>
                </div>
                
                {report?.monthlyBreakdown && report.monthlyBreakdown.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Sold</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.monthlyBreakdown.map((month, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {month.month}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-numbers">
                              Tshs. {month.totalSales.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {month.totalQuantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No sales data</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No sales were recorded for {report?.year}.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Navigation>
  );
}
