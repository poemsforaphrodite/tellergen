import { NextResponse } from 'next/server';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '@/lib/firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function POST(request: Request) {
  const { email, password } = await request.json();
  console.log('Login attempt:', { email }); // Don't log passwords

  try {
    // Verify the email and password with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await dbConnect();
    const dbUser = await User.findOne({ email: user.email });

    if (!dbUser) {
      return NextResponse.json({ success: false, message: 'User not found in database' }, { status: 404 });
    }

    // Set a cookie with the user's MongoDB _id
    const response = NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      uid: user.uid // Send the Firebase UID back to the client
    });
    response.cookies.set('token', dbUser._id.toString(), { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });
    return response;

  } catch (error: any) {
    console.error('Login error:', error.code, error.message);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ success: false, message: 'An error occurred during login' }, { status: 500 });
  }
}
