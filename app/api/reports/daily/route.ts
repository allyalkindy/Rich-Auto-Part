import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Debug: Check if we can connect to the database and find any sales
    const totalSalesCount = await Sale.countDocuments({});
    console.log('Total sales in database:', totalSalesCount);

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

    // Parse the date parameter and create proper date range
    const [year, month, day] = dateParam.split('-').map(Number);
    
    // Create start and end of day in local timezone
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    console.log('Daily report query:', {
      dateParam,
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

    // Find all sales for the specified date
    const sales = await Sale.find({
      date: { 
        $gte: startOfDay, 
        $lte: endOfDay 
      }
    }).sort({ date: -1 });

    console.log('Found sales with date range query:', sales.length);
    
    // If no sales found with date range, try a more flexible approach
    let salesFound = sales;
    let isFallbackData = false;
    if (sales.length === 0) {
      console.log('No sales found with date range, trying alternative search...');
      
      // Try a broader date range search (same day but with more flexible time)
      const startOfDayFlexible = new Date(year, month - 1, day);
      const endOfDayFlexible = new Date(year, month - 1, day + 1);
      
      const alternativeSales = await Sale.find({
        date: { 
          $gte: startOfDayFlexible, 
          $lt: endOfDayFlexible 
        }
      }).sort({ date: -1 });
      
      console.log('Alternative search found:', alternativeSales.length, 'sales');
      salesFound = alternativeSales;
    }
    
    // Debug: Log the first few sales to see their date format
    if (salesFound.length > 0) {
      console.log('Sample sales dates:', salesFound.slice(0, 3).map(s => ({
        id: s._id,
        date: s.date,
        dateISO: s.date.toISOString(),
        dateLocal: s.date.toLocaleDateString(),
        productName: s.productName
      })));
    }

    // Also try a broader search to see if there are any sales at all
    const allSalesCount = await Sale.countDocuments({});
    console.log('Total sales in database:', allSalesCount);
    
    if (allSalesCount > 0) {
      const sampleSales = await Sale.find({}).sort({ date: -1 }).limit(3);
      console.log('Sample sales from database:', sampleSales.map(s => ({
        id: s._id,
        date: s.date,
        dateISO: s.date.toISOString(),
        dateLocal: s.date.toLocaleDateString(),
        productName: s.productName
      })));
      
      // Also show the date range we're searching for
      console.log('Searching for sales between:', {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
        startOfDayLocal: startOfDay.toLocaleString(),
        endOfDayLocal: endOfDay.toLocaleString()
      });
    }

    const totalSalesAmount = salesFound.reduce((sum, sale) => sum + sale.salePrice, 0);
    const totalSales = salesFound.length; // Changed from totalProductsSold to totalSales

    const report = {
      totalSalesAmount,
      totalSales, // Changed from totalProductsSold to totalSales
      sales: salesFound.map(sale => ({
        _id: sale._id,
        productName: sale.productName,
        quantitySold: sale.quantitySold,
        salePrice: sale.salePrice,
        staffName: sale.staffName,
        date: sale.date,
      })),
      date: dateParam,
      isFallbackData, // Add flag to indicate if this is fallback data
      hasSales: salesFound.length > 0,
      message: salesFound.length === 0 
        ? `No sales recorded for ${dateParam}` 
        : `Found ${salesFound.length} sales for ${dateParam}`,
    };

    console.log('Report generated:', {
      totalSalesAmount,
      totalSales, // Updated log
      salesCount: salesFound.length
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating daily report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
