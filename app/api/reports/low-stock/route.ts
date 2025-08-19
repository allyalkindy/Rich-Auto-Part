import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    }).sort({ quantity: 1 });

    const products = lowStockProducts.map(product => ({
      _id: product._id.toString(),
      productName: product.productName,
      category: product.category,
      type: product.type,
      quantity: product.quantity,
      minimumStock: product.minimumStock,
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
