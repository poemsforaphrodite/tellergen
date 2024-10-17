import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getUserIdFromRequest } from '@/lib/auth'

// Define the type for updateQuery
type UpdateQuery = {
    textToSpeechCharacters?: number;
    voiceCloningCharacters?: number;
    credits?: number;
    talkingImageMinutes?: number;
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
      if (language === 'hi') {
        // For Hindi, only deduct if creditsUsed is <= 1000
        if (creditsUsed <= 1000) {
          if (user.textToSpeechCharacters < creditsUsed) {
            return NextResponse.json({ error: 'Insufficient Text to Speech Pro credits' }, { status: 400 })
          }
          updateQuery['textToSpeechCharacters'] = -creditsUsed;
        } else {
          // If creditsUsed > 1000, don't deduct any credits
          return NextResponse.json({ success: true, message: 'No credits deducted for Hindi voice over 1000 characters' })
        }
      } else {
        // For non-Hindi languages, proceed as before
        if (user.textToSpeechCharacters < creditsUsed) {
          return NextResponse.json({ error: 'Insufficient Text to Speech Pro credits' }, { status: 400 })
        }
        updateQuery['textToSpeechCharacters'] = -creditsUsed;
      }
    } else if (creditType === 'Voice Cloning Pro') {
      if (user.voiceCloningCharacters < creditsUsed) {
        return NextResponse.json({ error: 'Insufficient Voice Cloning Pro credits' }, { status: 400 })
      }
      updateQuery['voiceCloningCharacters'] = -creditsUsed;
    } else if (creditType === 'Talking Image') {
      if (user.talkingImageMinutes < creditsUsed) {
        return NextResponse.json({ error: 'Insufficient Talking Image Pro credits' }, { status: 400 })
      }
      updateQuery['talkingImageMinutes'] = -creditsUsed;
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
        { new: true, select: 'credits textToSpeechCharacters voiceCloningCharacters talkingImageMinutes' }
      )
      return NextResponse.json({ success: true, credits: updatedUser })
    } else {
      return NextResponse.json({ success: true, message: 'No credits deducted' })
    }
  } catch (error) {
    console.error('Error updating user credits:', error)
    return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
  }
}
