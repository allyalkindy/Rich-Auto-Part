import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user?.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const sales = await Sale.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
    const totalProductsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);

    // Group by category
    const categoryBreakdown = sales.reduce((acc, sale) => {
      const category = sale.productName.split(' ')[0]; // Simple category extraction
      if (!acc[category]) {
        acc[category] = { totalSales: 0, totalQuantity: 0 };
      }
      acc[category].totalSales += sale.salePrice;
      acc[category].totalQuantity += sale.quantitySold;
      return acc;
    }, {} as Record<string, { totalSales: number; totalQuantity: number }>);

    const categoryBreakdownArray = Object.entries(categoryBreakdown).map(([category, data]) => ({
      category,
      totalSales: data.totalSales,
      totalQuantity: data.totalQuantity,
    }));

    const report = {
      totalSalesAmount,
      totalProductsSold,
      categoryBreakdown: categoryBreakdownArray,
      month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
      year,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
