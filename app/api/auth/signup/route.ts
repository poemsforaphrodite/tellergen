import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { MongoServerError } from 'mongodb';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: Request) {
  await dbConnect();

  const { username, email, password } = await request.json();
  console.log('Signup attempt:', { username, email }); // Don't log passwords

  try {
    // Create user in Firebase
    const firebaseAuth = getAuth();
    const firebaseUser = await firebaseAuth.createUser({
      email,
      password,
      displayName: username,
    });

    console.log('Firebase user created:', firebaseUser.uid);

    // Check if user already exists in MongoDB (by email only)
    console.log('Checking for existing user with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', existingUser);
      // Delete the Firebase user if MongoDB user already exists
      await firebaseAuth.deleteUser(firebaseUser.uid);
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
    }

    // Hash password for MongoDB (Firebase already handles its own password hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in MongoDB with 1000 default credits for each service
    const newUser = new User({
      firebaseUid: firebaseUser.uid, // Store Firebase UID
      username,
      email,
      password: hashedPassword,
      credits: 1000,
      textToSpeechCharacters: 1000,
      voiceCloningCharacters: 1000,
      talkingImageCharacters: 0
    });

    await newUser.save();
    console.log('New user created:', { 
      username, 
      email, 
      firebaseUid: firebaseUser.uid,
      credits: 1000, 
      textToSpeechCharacters: 1000, 
      voiceCloningCharacters: 1000, 
      talkingImageCharacters: 0
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
