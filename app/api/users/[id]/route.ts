import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { name, email, role, password } = await request.json();

    // Only owners can change roles; users can update their own name/email/password
    if (role && session.user?.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const update: any = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (role) update.role = role;
    if (password) update.password = await bcrypt.hash(password, 12);

    const updated = await User.findByIdAndUpdate(params.id, update, { new: true, select: '-password' });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.user?.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await dbConnect();
    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


