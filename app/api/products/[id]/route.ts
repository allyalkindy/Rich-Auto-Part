import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { sendLowStockAlert } from '@/lib/email';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productName, category, type, quantity, pricePerUnit, minimumStock } =
      await request.json();

    await dbConnect();

    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        productName,
        category,
        type,
        quantity,
        pricePerUnit,
        minimumStock,
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if stock is low and send notification
    if (quantity <= minimumStock) {
      await sendLowStockAlert([{
        _id: product._id.toString(),
        productName: product.productName,
        category: product.category,
        type: product.type,
        quantity: product.quantity,
        minimumStock: product.minimumStock,
      }]);
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle /restock endpoint
  const url = new URL(request.url);
  if (url.pathname.endsWith('/restock')) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const { amount } = await request.json();
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ error: 'Invalid restock amount' }, { status: 400 });
      }
      await dbConnect();
      const product = await Product.findById(params.id);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      product.quantity += amount;
      await product.save();
      // Optionally send low stock alert if still low
      if (product.quantity <= product.minimumStock) {
        await sendLowStockAlert([
          {
            _id: product._id.toString(),
            productName: product.productName,
            category: product.category,
            type: product.type,
            quantity: product.quantity,
            minimumStock: product.minimumStock,
          },
        ]);
      }
      return NextResponse.json(product);
    } catch (error) {
      console.error('Error restocking product:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
  // If not /restock, return 404
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
