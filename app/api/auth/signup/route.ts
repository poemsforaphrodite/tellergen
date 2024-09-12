import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { MongoServerError } from 'mongodb';

export async function POST(request: Request) {
  await dbConnect();

  const { username, email, password } = await request.json();
  console.log('Signup attempt:', { username, email }); // Don't log passwords

  try {
    // Check if user already exists (by email or username)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log('New user created:', { username, email });

    return NextResponse.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof MongoServerError) {
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        return NextResponse.json({ success: false, message: `${field} already exists` }, { status: 400 });
      }
    }
    return NextResponse.json({ success: false, message: 'An error occurred during signup' }, { status: 500 });
  }
}