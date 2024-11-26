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
    const { service, amount } = await request.json()
    
    // Validate input
    if (!service || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check subscription status for Text to Speech Pro
    if (service === 'Text to Speech Pro') {
      const ttsSubscription = user.subscriptions?.textToSpeech
      const isSubscriptionActive = ttsSubscription?.active && 
        ttsSubscription?.endDate && 
        new Date(ttsSubscription.endDate) > new Date()
      
      if (isSubscriptionActive) {
        return NextResponse.json({ success: true, unlimited: true })
      }
    }

    // Map service to credit field
    const creditField = {
      'Text to Speech Pro': 'textToSpeechCharacters',
      'Voice Cloning Pro': 'voiceCloningCharacters',
      'Talking Image': 'talkingImageCharacters'
    }[service] || 'credits'

    // Check if user has enough credits
    if (user[creditField] < amount) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        remaining: user[creditField]
      }, { status: 400 })
    }

    // Deduct credits
    const updateQuery = { $inc: { [creditField]: -amount } }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateQuery,
      { new: true, select: creditField }
    )

    return NextResponse.json({ 
      success: true,
      remaining: updatedUser[creditField]
    })
  } catch (error) {
    console.error('Error deducting credits:', error)
    return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
  }
}