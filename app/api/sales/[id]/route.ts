import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
import Product from '@/models/Product';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quantitySold, salePrice } = await request.json();

    if (!quantitySold || !salePrice) {
      return NextResponse.json(
        { error: 'Quantity and sale price are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the current sale to find the product
    const currentSale = await Sale.findById(params.id);
    if (!currentSale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Update the sale
    const updatedSale = await Sale.findByIdAndUpdate(
      params.id,
      { quantitySold, salePrice },
      { new: true }
    );

    // Update product stock (add back old quantity, subtract new quantity)
    const product = await Product.findById(currentSale.productId);
    if (product) {
      const quantityDifference = currentSale.quantitySold - quantitySold;
      product.quantity += quantityDifference;
      await product.save();
    }

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error('Error updating sale:', error);
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

    // Get the sale to find the product before deleting
    const sale = await Sale.findById(params.id);
    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Restore product stock
    const product = await Product.findById(sale.productId);
    if (product) {
      product.quantity += sale.quantitySold;
      await product.save();
    }

    // Delete the sale
    await Sale.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
