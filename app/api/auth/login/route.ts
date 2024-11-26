import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const { event, session } = await request.json();

    if (event === 'SIGNED_IN') {
      const user = session?.user;
      if (!user) throw new Error('No user in session');

      // Check if user exists in users table
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!userData) {
        // Create new user if they don't exist
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: user.email,
              credits: 10000,
              name: user.user_metadata?.full_name,
              avatar_url: user.user_metadata?.avatar_url
            }
          ]);

        if (insertError) throw insertError;
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        user
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Invalid event' 
    }, { status: 400 });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Authentication failed' 
    }, { status: 401 });
  }
}
