import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    console.log('Signup attempt:', { email }); // Don't log passwords

    const supabase = createRouteHandlerClient({ cookies });

    // Sign up the user with Supabase
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (signUpError) {
      console.error('Signup error:', signUpError);
      return NextResponse.json(
        { success: false, message: signUpError.message },
        { status: 400 }
      );
    }

    // Create initial user record in the users table
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user?.id,
          email,
          name,
          credits: 1000
        }
      ]);

    if (insertError) {
      console.error('Database error:', insertError);
      // If there's an error creating the user record, we should clean up the auth user
      if (authData.user?.id) {
        await supabase.auth.admin.deleteUser(authData.user.id);
      }
      return NextResponse.json(
        { success: false, message: 'Failed to create user record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully',
      user: authData.user
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
