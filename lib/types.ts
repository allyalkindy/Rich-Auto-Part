export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'staff';
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  productName: string;
  category: string;
  quantity: number;
  pricePerUnit: number;
  minimumStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  _id: string;
  productId: string;
  productName: string;
  quantitySold: number;
  salePrice: number;
  date: Date;
  staffId: string;
  staffName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyReport {
  totalSalesAmount: number;
  totalProductsSold: number;
  sales: Sale[];
  date: string;
}

export interface MonthlyReport {
  totalSalesAmount: number;
  totalProductsSold: number;
  categoryBreakdown: {
    category: string;
    totalSales: number;
    totalQuantity: number;
  }[];
  month: string;
  year: number;
}

export interface YearlyReport {
  totalSalesAmount: number;
  totalProductsSold: number;
  monthlyBreakdown: {
    month: string;
    totalSales: number;
    totalQuantity: number;
  }[];
  year: number;
}

export interface LowStockProduct {
  _id: string;
  productName: string;
  category: string;
  quantity: number;
  minimumStock: number;
}
