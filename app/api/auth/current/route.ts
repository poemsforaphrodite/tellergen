import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

// Placeholder function to extract user ID from request.
// Replace this with your actual authentication logic (e.g., JWT, sessions).
const getUserIdFromRequest = (request: Request): string | null => {
  // Example: Extract from cookies
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/token=([^;]+)/)
  return match ? match[1] : null
}

export async function GET(request: Request) {
  await dbConnect()

  const userId = getUserIdFromRequest(request)

  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  try {
    const user = await User.findById(userId).select('-password')
    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}