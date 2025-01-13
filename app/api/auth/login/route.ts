import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email and password are required' 
      }, { status: 400 });
    }

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      user
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Authentication failed' 
    }, { status: 401 });
  }
}
