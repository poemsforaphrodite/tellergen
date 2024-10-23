import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getUserIdFromRequest } from '@/lib/auth'

// Define the type for updateQuery
type UpdateQuery = {
    voiceCloningCharacters?: number;
    credits?: number;
    talkingImageCharacters?: number;
};

export async function POST(request: Request) {
  await dbConnect()

  const userId = getUserIdFromRequest()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { creditsUsed, creditType, language } = await request.json()

    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateQuery: UpdateQuery = {};

    if (creditType === 'Text to Speech Pro') {
      // Check if TTS subscription is active and not expired
      const ttsSubscription = user.subscriptions?.textToSpeech;
      const isSubscriptionActive = ttsSubscription?.active && 
        ttsSubscription?.endDate && 
        new Date(ttsSubscription.endDate) > new Date();

      // If subscription has expired, update it in the database
      if (ttsSubscription?.active && !isSubscriptionActive) {
        await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              'subscriptions.textToSpeech.active': false
            }
          }
        );
      }

      // Don't deduct credits for Hindi text over 1000 characters
      if (language === 'hi' && creditsUsed > 1000) {
        return NextResponse.json({ success: true, message: 'No credits deducted for Hindi voice over 1000 characters' })
      }

      // Skip credit deduction if subscription is active
      if (isSubscriptionActive) {
        return NextResponse.json({ success: true, message: 'No credits deducted - Active subscription' })
      }
      
      // Deduct credits only if no active subscription
      if (user.credits >= creditsUsed) {
        updateQuery['credits'] = -creditsUsed;
      } else {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
      }
    } else if (creditType === 'Voice Cloning Pro') {
      if (user.voiceCloningCharacters >= creditsUsed) {
        updateQuery['voiceCloningCharacters'] = -creditsUsed;
      } else if (user.credits >= creditsUsed) {
        updateQuery['credits'] = -creditsUsed;
      } else {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
      }
    } else if (creditType === 'Talking Image') {
      if (typeof user.talkingImageCharacters === 'undefined') {
        return NextResponse.json({ error: 'Talking Image credits not initialized for user' }, { status: 400 })
      }
      if (user.talkingImageCharacters >= creditsUsed) {
        updateQuery['talkingImageCharacters'] = -creditsUsed;
      } else {
        return NextResponse.json({ 
          error: 'Insufficient Talking Image credits', 
          available: user.talkingImageCharacters, 
          required: creditsUsed 
        }, { status: 400 })
      }
    } else {
      if (user.credits < creditsUsed) {
        return NextResponse.json({ error: 'Insufficient common credits' }, { status: 400 })
      }
      updateQuery['credits'] = -creditsUsed;
    }

    // Only update the user if there are credits to deduct
    if (Object.keys(updateQuery).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: updateQuery },
        { new: true, select: 'credits voiceCloningCharacters talkingImageCharacters' }
      )
      return NextResponse.json({ success: true, credits: updatedUser })
    } else {
      return NextResponse.json({ success: true, message: 'No credits deducted' })
    }
  } catch (error) {
    console.error('Error updating user credits:', error)
    return NextResponse.json({ error: 'Failed to update credits', details: (error as Error).message }, { status: 500 })
  }
}
