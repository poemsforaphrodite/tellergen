import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getUserIdFromRequest } from '@/lib/auth'

export async function POST(request: Request) {
  await dbConnect()

  const userId = getUserIdFromRequest()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { creditsUsed } = await request.json()

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: -creditsUsed } },
      { new: true, select: 'credits' }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, credits: user.credits })
  } catch (error) {
    console.error('Error updating user credits:', error)
    return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
  }
}