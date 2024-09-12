import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  await dbConnect();

  const { email, password } = await request.json();
  console.log('Login attempt:', { email }); // Don't log passwords

  try {
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Here you would typically create a session or JWT token
    const userWithoutPassword = { ...user.toObject(), password: undefined };
    return NextResponse.json({ success: true, message: 'Login successful', user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'An error occurred during login' }, { status: 500 });
  }
}