import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

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
      return NextResponse.json(
        { success: false, message: signUpError.message },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      { success: false, message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
