import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const type = searchParams.get('type');

    let query: any = {};

    if (search) {
      query.productName = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }
    if (type) {
      query.type = type;
    }

    // If search is provided, include category and type in text search
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
      delete query.productName;
    }

    // Only return products with quantity > 0 for public search
    query.quantity = { $gt: 0 };

    const products = await Product.find(query)
      .select('productName category type quantity minimumStock') // Only return necessary fields for public
      .sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
