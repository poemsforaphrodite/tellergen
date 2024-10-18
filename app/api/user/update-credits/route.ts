import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getUserIdFromRequest } from '@/lib/auth'

// Define the type for updateQuery
type UpdateQuery = {
    textToSpeechCharacters?: number;
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
    const { creditsUsed, creditType, language, useDefaultCredits } = await request.json()

    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateQuery: UpdateQuery = {};

    if (creditType === 'Text to Speech Pro') {
      if (language === 'hi' && creditsUsed > 1000) {
        return NextResponse.json({ success: true, message: 'No credits deducted for Hindi voice over 1000 characters' })
      }
      
      if (user.textToSpeechCharacters >= creditsUsed) {
        updateQuery['textToSpeechCharacters'] = -creditsUsed;
      } else if (useDefaultCredits && user.credits >= creditsUsed) {
        // Use default credits if Text to Speech Pro credits are insufficient
        updateQuery['credits'] = -creditsUsed;
      } else {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
      }
    } else if (creditType === 'Voice Cloning Pro') {
      if (user.voiceCloningCharacters >= creditsUsed) {
        updateQuery['voiceCloningCharacters'] = -creditsUsed;
      } else if (useDefaultCredits && user.credits >= creditsUsed) {
        // Use default credits if Voice Cloning Pro credits are insufficient
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
        { new: true, select: 'credits textToSpeechCharacters voiceCloningCharacters talkingImageCharacters' }
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
