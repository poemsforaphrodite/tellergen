import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Sign out on the server side
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Server-side sign out error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Clear all cookies
    const cookieStore = cookies()
    for (const cookie of cookieStore.getAll()) {
      cookieStore.delete(cookie.name)
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Logout error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}