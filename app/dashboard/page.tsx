'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingCart, DollarSign, AlertTriangle, BarChart3 } from 'lucide-react';
import Loader from '@/components/ui/Loader';

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  lowStockCount: number;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const [productsRes, salesRes, lowStockRes] = await Promise.all([
    fetch('/api/products'),
    fetch('/api/sales'),
    fetch('/api/reports/low-stock'),
  ]);

  const products = await productsRes.json();
  const sales = await salesRes.json();
  const lowStock = await lowStockRes.json();

  const totalRevenue = sales.reduce((sum: number, sale: any) => sum + sale.salePrice, 0);

  return {
    totalProducts: products.length,
    totalSales: sales.length,
    totalRevenue,
    lowStockCount: lowStock.length,
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <Loader fullScreen message="Preparing your dashboard..." />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Navigation>
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-8 sm:px-0">
          <h1 className="text-4xl font-extrabold text-primary-700 mb-8 tracking-tight drop-shadow-sm">
            Welcome back, {session?.user?.name}!
          </h1>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl animate-pulse h-32 flex items-center justify-center">
                  <div className="space-y-2 w-full px-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white/90 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl p-6 flex items-center gap-4 hover:shadow-2xl transition-shadow">
                <div className="flex-shrink-0 bg-primary-50 rounded-full p-3">
                  <Package className="h-7 w-7 text-primary-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Products</div>
                  <div className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl p-6 flex items-center gap-4 hover:shadow-2xl transition-shadow">
                <div className="flex-shrink-0 bg-primary-50 rounded-full p-3">
                  <ShoppingCart className="h-7 w-7 text-primary-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Sales</div>
                  <div className="text-2xl font-bold text-gray-900">{stats?.totalSales || 0}</div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl p-6 flex items-center gap-4 hover:shadow-2xl transition-shadow">
                <div className="flex-shrink-0 bg-primary-50 rounded-full p-3">
                  <DollarSign className="h-7 w-7 text-primary-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                  <div className="text-2xl font-bold text-gray-900 font-numbers">Tshs. {stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-md overflow-hidden shadow-xl rounded-2xl p-6 flex items-center gap-4 hover:shadow-2xl transition-shadow">
                <div className="flex-shrink-0 bg-red-50 rounded-full p-3">
                  <AlertTriangle className="h-7 w-7 text-red-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Low Stock Items</div>
                  <div className="text-2xl font-bold text-red-600">{stats?.lowStockCount || 0}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-primary-700 mb-6 tracking-tight">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href="/products"
                className="bg-white/90 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow flex flex-col items-center text-center group border border-primary-100 hover:border-primary-300"
              >
                <Package className="h-10 w-10 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-900">Manage Products</h3>
                <p className="text-sm text-gray-500">Add, edit, or remove products</p>
              </a>
              <a
                href="/sales"
                className="bg-white/90 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow flex flex-col items-center text-center group border border-primary-100 hover:border-primary-300"
              >
                <ShoppingCart className="h-10 w-10 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-900">Record Sales</h3>
                <p className="text-sm text-gray-500">Record new sales transactions</p>
              </a>
              {session?.user?.role === 'owner' && (
                <a
                  href="/reports/daily"
                  className="bg-white/90 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow flex flex-col items-center text-center group border border-primary-100 hover:border-primary-300"
                >
                  <BarChart3 className="h-10 w-10 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900">View Reports</h3>
                  <p className="text-sm text-gray-500">Check sales and inventory reports</p>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
