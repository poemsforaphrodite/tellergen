import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getUserIdFromRequest } from '@/lib/auth'
import { Types } from 'mongoose'

export async function GET() {
  await dbConnect()

  const userId = getUserIdFromRequest()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Validate that userId is a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const user = await User.findById(userId).select(
      'credits textToSpeechCharacters voiceCloningCharacters talkingImageCharacters subscriptions'
    )
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if TTS subscription is active and not expired
    const ttsSubscription = user.subscriptions?.textToSpeech
    const isSubscriptionActive = ttsSubscription?.active && 
      ttsSubscription?.endDate && 
      new Date(ttsSubscription.endDate) > new Date()

    // Check if characters should be locked
    const shouldLockCharacters = user.credits <= 1000 && !isSubscriptionActive

    return NextResponse.json({
      credits: {
        common: user.credits || 0,
        'Text to Speech Pro': {
          isSubscribed: isSubscriptionActive,
          subscriptionEndDate: isSubscriptionActive ? ttsSubscription?.endDate : null,
          isLocked: shouldLockCharacters // Add this field to indicate if characters are locked
        },
        'Voice Cloning Pro': user.voiceCloningCharacters || 0,
        'Talking Image': user.talkingImageCharacters || 0
      }
    })
  } catch (error) {
    console.error('Error fetching user credits:', error)
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
  }
}
