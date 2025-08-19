import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
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
    const date = searchParams.get('date');

    let query: any = {};

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const sales = await Sale.find(query)
      .populate('productId', 'productName category type')
      .sort({ date: -1 });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
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

    const { productId, quantitySold, sellingPricePerUnit } = await request.json();

    if (!productId || !quantitySold || quantitySold <= 0) {
      return NextResponse.json(
        { error: 'Product ID and valid quantity are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if enough stock is available
    if (product.quantity < quantitySold) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Calculate sale price using custom price if provided, otherwise use product price
    const finalPricePerUnit = sellingPricePerUnit || product.pricePerUnit;
    const salePrice = finalPricePerUnit * quantitySold;

    // Create the sale record
    const sale = await Sale.create({
      productId,
      productName: product.productName,
      quantitySold,
      salePrice,
      date: new Date(),
      staffId: session.user.id,
      staffName: session.user.name,
    });

    console.log('Sale created:', {
      saleId: sale._id,
      date: sale.date,
      dateISO: sale.date.toISOString(),
      dateLocal: sale.date.toLocaleString()
    });

    // Update product quantity
    const newQuantity = product.quantity - quantitySold;
    await Product.findByIdAndUpdate(productId, { quantity: newQuantity });

    // Check if stock is now low and send notification
    if (newQuantity <= product.minimumStock) {
      await sendLowStockAlert([{
        _id: product._id.toString(),
        productName: product.productName,
        category: product.category,
        type: product.type,
        quantity: newQuantity,
        minimumStock: product.minimumStock,
      }]);
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
