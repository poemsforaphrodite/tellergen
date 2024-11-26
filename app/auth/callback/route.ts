import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const cookieStore = cookies()
  
  try {
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    if (error) {
      console.error('Auth provider error:', { error, error_description })
      // For development debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Full error details:', { error, error_description, url: request.url })
      }
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error_description || error)}`
      )
    }

    if (!code) {
      console.error('No authorization code provided in callback')
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('Authentication failed: No authorization code provided. Please try signing in again.')}`
      )
    }

    // Create a Supabase client with the cookie store for auth
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // Exchange the code for a session
      const { data: authData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('Session creation error:', sessionError)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to create session. Please try again.')}`
        )
      }

      // Get the user from the session
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Error getting user:', userError)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to get user information.')}`
        )
      }

      // Debug logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth successful. User data:', {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        })
      }

      // Create an admin client for database operations
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      try {
        // Attempt to create the user directly (upsert)
        const { error: upsertError } = await adminClient
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            credits: 10000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (upsertError) {
          console.error('Database error:', upsertError)
          throw upsertError
        }

        return NextResponse.redirect(`${requestUrl.origin}/home`)
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to create user account. Please try again.')}`
        )
      }
    } catch (authError) {
      console.error('Authentication process failed:', authError)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('Authentication process failed. Please try again.')}`
      )
    }
  } catch (error) {
    console.error('Critical error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(`Authentication failed: ${errorMessage}`)}`
    )
  }
}
