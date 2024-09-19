import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getUserIdFromRequest } from '@/lib/auth'

const creditOptions = [
  { credits: 50000, price: 99 },
  { credits: 200000, price: 249 },
  { credits: 500000, price: 499 },
  { credits: 1000000, price: 799 },
  { credits: 2000000, price: 1299 },
]

export async function POST(request: Request) {
  await dbConnect()

  const userId = getUserIdFromRequest()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { credits } = await request.json()

  const option = creditOptions.find(opt => opt.credits === credits)
  if (!option) {
    return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: option.credits } },
      { new: true, select: 'credits' }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ newCredits: user.credits })
  } catch (error) {
    console.error('Error purchasing credits:', error)
    return NextResponse.json({ error: 'Failed to purchase credits' }, { status: 500 })
  }
}