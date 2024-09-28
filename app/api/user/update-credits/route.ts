import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getUserIdFromRequest } from '@/lib/auth'

// Define the type for updateQuery
type UpdateQuery = {
    textToSpeechCharacters?: number;
    voiceCloningCharacters?: number;
    credits?: number;
    talkingImageMinutes?: number; // Add this line
};

export async function POST(request: Request) {
  await dbConnect()

  const userId = getUserIdFromRequest()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { creditsUsed, creditType } = await request.json()

    const updateQuery: UpdateQuery = {}; // Initialize with the defined type

    if (creditType === 'Text to Speech Pro') {
      updateQuery['textToSpeechCharacters'] = -creditsUsed;
    } else if (creditType === 'Voice Cloning Pro') {
      updateQuery['voiceCloningCharacters'] = -creditsUsed;
    } else if (creditType === 'Talking Image') {
      updateQuery['talkingImageMinutes'] = -creditsUsed; // Assuming 1 minute = 6 credits
    } else {
      updateQuery['credits'] = -creditsUsed; // Default to common credits
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: updateQuery },
      { new: true, select: 'credits textToSpeechCharacters voiceCloningCharacters talkingImageMinutes' }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, credits: user })
  } catch (error) {
    console.error('Error updating user credits:', error)
    return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
  }
}