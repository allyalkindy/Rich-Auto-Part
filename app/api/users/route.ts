import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user?.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Users list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


