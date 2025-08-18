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
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const sales = await Sale.find({
      date: { $gte: startOfYear, $lte: endOfYear }
    });

    const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
    const totalProductsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);

    // Group by month
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0, 23, 59, 59, 999);
      
      const monthSales = sales.filter(sale => 
        sale.date >= monthStart && sale.date <= monthEnd
      );

      const monthTotalSales = monthSales.reduce((sum, sale) => sum + sale.salePrice, 0);
      const monthTotalQuantity = monthSales.reduce((sum, sale) => sum + sale.quantitySold, 0);

      return {
        month: new Date(year, i).toLocaleString('default', { month: 'long' }),
        totalSales: monthTotalSales,
        totalQuantity: monthTotalQuantity,
      };
    });

    const report = {
      totalSalesAmount,
      totalProductsSold,
      monthlyBreakdown,
      year,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating yearly report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
