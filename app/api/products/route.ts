import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { sendLowStockAlert } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productName, category, quantity, pricePerUnit, minimumStock, type } =
      await request.json();

    if (!productName || !category || quantity === undefined || pricePerUnit === undefined || minimumStock === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.create({
      productName,
      category,
      type,
      quantity,
      pricePerUnit,
      minimumStock,
    });

    // Check if stock is low and send notification
    if (quantity <= minimumStock) {
      await sendLowStockAlert([{
        _id: product._id.toString(),
        productName,
        category,
        type,
        quantity,
        minimumStock,
      }]);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
