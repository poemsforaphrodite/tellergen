import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  console.log('Forget password request received');
  await dbConnect();
  console.log('Database connected');

  const { email } = await request.json();
  console.log(`Forget password request for email: ${email}`);

  if (!email) {
    console.log('Email is missing in the request');
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    console.log('Searching for user in database...');
    const user = await User.findOne({ email });
    console.log('Database query completed');
    console.log(`User found: ${user ? 'Yes' : 'No'}`);

    if (user) {
      console.log('User details:', {
        id: user._id,
        username: user.username,
        email: user.email,
        // Don't log sensitive information like passwords
      });
    } else {
      console.log('No user found with this email');
      // Log the total count of users in the database
      const userCount = await User.countDocuments();
      console.log(`Total users in database: ${userCount}`);
    }

    if (!user) {
      console.log('User not found, sending generic response');
      return NextResponse.json(
        { message: 'If that email is registered, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log('Reset token generated');

    // Set token and expiration on user
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now
    await user.save();
    console.log('Reset token saved to user document');

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      console.log('Password reset email sent successfully');
    } catch (emailError: any) {
      console.error('Error sending password reset email:', emailError.message);
      console.error('Error details:', emailError);
      // Even if email sending fails, we don't want to expose this to the user
      // But we'll log it for debugging purposes
    }

    return NextResponse.json(
      { message: 'If that email is registered, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in forget-password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}