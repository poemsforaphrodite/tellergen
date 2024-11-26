import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      await supabase.auth.exchangeCodeForSession(code);
      
      // Get the user from the newly created session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (user) {
        // Check if user exists in users table
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (!existingUser) {
          // Create new user if they don't exist
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name,
                credits: 1000
              }
            ]);

          if (insertError) throw insertError;
        }
      }

      return NextResponse.redirect(requestUrl.origin + '/home');
    } catch (error) {
      console.error('Auth error:', error);
      return NextResponse.redirect(
        requestUrl.origin + '/login?error=' + encodeURIComponent('Authentication failed')
      );
    }
  }

  return NextResponse.redirect(
    requestUrl.origin + '/login?error=' + encodeURIComponent('No code provided')
  );
}