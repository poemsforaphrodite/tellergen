import { NextResponse } from 'next/server';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export async function POST(request: Request) {
  console.log('Forget password request received');

  const { email } = await request.json();
  console.log(`Forget password request for email: ${email}`);

  if (!email) {
    console.log('Email is missing in the request');
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const auth = getAuth();

  return sendPasswordResetEmail(auth, email)
    .then(() => {
      console.log('Password reset email sent successfully');
      return NextResponse.json(
        { message: 'If an account exists with that email, a password reset link has been sent.' },
        { status: 200 }
      );
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Error in forget-password:', error);
      console.error('Error code:', errorCode);
      console.error('Error message:', errorMessage);

      if (errorCode === 'auth/user-not-found') {
        return NextResponse.json(
          { message: 'If an account exists with that email, a password reset link has been sent.' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'An error occurred. Please try again later.', details: errorMessage },
        { status: 500 }
      );
    });
}
