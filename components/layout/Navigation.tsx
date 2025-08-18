'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, ReactNode } from 'react';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  AlertTriangle, 
  LogOut, 
  User, 
  Menu,
  X,
  ChevronDown,
  Calendar,
  TrendingUp,
  PieChart
} from 'lucide-react';

interface NavigationProps {
  children: ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
    { name: 'Low Stock', href: '/low-stock', icon: AlertTriangle },
    { name: 'Settings', href: '/settings', icon: User },
    // Owner-only main link aligned with other items
    ...(session?.user?.role === 'owner' ? [{ name: 'Manage Staff', href: '/manage-staff', icon: User }] : []),
  ];

  const reportOptions = [
    { name: 'Daily Report', href: '/reports/daily', icon: Calendar },
    { name: 'Monthly Report', href: '/reports/monthly', icon: TrendingUp, ownerOnly: true },
    { name: 'Yearly Report', href: '/reports/yearly', icon: PieChart, ownerOnly: true },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    if (href.startsWith('/reports')) {
      return pathname.startsWith('/reports');
    }
    return pathname === href;
  };

  const isReportsActive = () => {
    return pathname.startsWith('/reports');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex">
      {/* Sidebar */}
      <div
        className={`fixed left-0 z-40 w-64 bg-white/95 shadow-2xl border-r border-primary-100 transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ top: '4rem', height: 'calc(100vh - 4rem)' }}
      >
        <div className="h-full flex flex-col pt-0">
          {/* Sidebar header with close button always visible and sticky */}
          <div className="flex items-center justify-end px-6 py-4 border-b border-primary-100 bg-white/80 sticky top-0 z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {/* Sidebar content */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation
              .filter((item) => item.name !== 'Settings' || !!session?.user)
              .map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-700 bg-primary-100 border-l-4 border-primary-600 shadow'
                      : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Reports Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                  isReportsActive()
                    ? 'text-primary-700 bg-primary-100 border-l-4 border-primary-600 shadow'
                    : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  Reports
                </div>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    reportsOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {/* Reports Submenu */}
              {reportsOpen && (
                <div className="ml-8 space-y-1">
                  {reportOptions
                    .filter((option) => !('ownerOnly' in option) || !option.ownerOnly || session?.user?.role === 'owner')
                    .map((option) => {
                      const Icon = option.icon;
                      return (
                        <Link
                          key={option.name}
                          href={option.href}
                          className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            pathname === option.href
                              ? 'text-primary-600 bg-primary-50 border-l-2 border-primary-400'
                              : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          {option.name}
                        </Link>
                      );
                    })}
                  
                </div>
              )}
            </div>
          </nav>
          {/* User info and sign out */}
          <div className="px-6 py-4 border-t border-primary-100 bg-white/80 flex items-center gap-3 sticky bottom-0">
            <User className="h-6 w-6 text-primary-500" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{session?.user?.role}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-gray-400 hover:text-primary-600 p-2 rounded-md hover:bg-primary-50"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        {/* Top Navigation Bar */}
        <nav className="bg-white/80 shadow-sm border-b border-primary-100 fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-4 lg:px-8">
          {/* Sidebar toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 mr-2"
            aria-label="Open sidebar"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="text-lg font-semibold text-primary-700 tracking-tight font-heading">Rich Auto Parts</span>
          <div className="flex-1" />
          {/* Home button and sign out button on the far right */}
          <Link
            href="/"
            className={`px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center gap-2 text-gray-600 hover:text-primary-700 hover:bg-primary-50`}
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-gray-400 hover:text-primary-600 p-2 rounded-md hover:bg-primary-50 ml-2"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </nav>
        <main className="flex-1 pt-20 pb-8 px-4 sm:px-8 bg-gradient-to-br from-primary-50 to-white min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
