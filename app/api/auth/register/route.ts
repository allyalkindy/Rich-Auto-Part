import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Only authenticated owner can create staff accounts
    // But allow bootstrap owner creation if no users exist and a setup secret is provided
    const session = await getServerSession(authOptions);
    const totalUsers = await User.countDocuments();
    if (!session) {
      // Bootstrap path: first user creation with SETUP_OWNER_SECRET
      const setupSecret = process.env.SETUP_OWNER_SECRET;
      const providedSecret = request.headers.get('x-setup-secret') || '';
      if (totalUsers === 0 && setupSecret && providedSecret === setupSecret) {
        const hashedPassword = await bcrypt.hash(password, 12);
        const owner = await User.create({
          name,
          email,
          password: hashedPassword,
          role: 'owner',
        });
        const { password: __, ...ownerWithoutPassword } = owner.toObject();
        return NextResponse.json(
          { message: 'Owner created successfully', user: ownerWithoutPassword },
          { status: 201 }
        );
      }
      return NextResponse.json(
        { error: 'Only the owner can create staff accounts' },
        { status: 403 }
      );
    }
    if (session.user?.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only the owner can create staff accounts' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (force staff role regardless of input)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'staff',
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
