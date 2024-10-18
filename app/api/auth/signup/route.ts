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
    // Check if user already exists (by email only)
    console.log('Checking for existing user with email:', email); // Updated logging
    const existingUser = await User.findOne({ email }); // Check only by email
    if (existingUser) {
      console.log('User already exists:', existingUser); // Log existing user details
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with 1000 default credits for each service
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      credits: 1000, // Set default common credits to 1000
      textToSpeechCharacters: 1000, // Set default Text to Speech Pro credits to 1000
      voiceCloningCharacters: 1000, // Set default Voice Cloning Pro credits to 1000
      talkingImageCharacters: 100 // Set default Talking Image credits to 1000
    });

    await newUser.save();
    console.log('New user created:', { 
      username, 
      email, 
      credits: 1000, 
      textToSpeechCharacters: 1000, 
      voiceCloningCharacters: 1000, 
      talkingImageCharacters: 100 
    });

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