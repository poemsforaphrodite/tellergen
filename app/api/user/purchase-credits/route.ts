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

  const { product, price } = await request.json()

  try {
    let updateQuery = {}

    if (product.endsWith('_pro')) {
      // Handle subscription purchase
      updateQuery = { [`subscriptions.${product}`]: true }
    } else {
      // Handle credit purchase
      const creditsAmount = parseInt(product.split('_')[0], 10)
      if (isNaN(creditsAmount)) {
        return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
      }
      updateQuery = { $inc: { credits: creditsAmount } }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateQuery,
      { new: true, select: 'credits subscriptions' }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // In a real-world scenario, you would process the payment here
    // For now, we're just updating the user's account

    return NextResponse.json({ success: true, user: { credits: user.credits, subscriptions: user.subscriptions } })
  } catch (error) {
    console.error('Error processing purchase:', error)
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 })
  }
}