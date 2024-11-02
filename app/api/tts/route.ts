import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BaseVoice from '@/models/BaseVoice'
import fetch from 'node-fetch'
import path from 'path'

const SERVER_IP = '39.114.73.97'
const PORT = '34123'
const BASE_URL = `http://${SERVER_IP}:${PORT}`

async function uploadVoiceSample(file: Blob, filename: string): Promise<boolean> {
  const formData = new FormData()
  const wavFilename = filename.replace(/\.[^/.]+$/, '.wav')
  formData.append('wavFile', file, wavFilename)

  const response = await fetch(`${BASE_URL}/upload_sample`, {
    method: 'POST',
    body: formData,
  })

  if (response.ok) {
    console.log('Voice sample uploaded successfully')
    return true
  } else {
    console.error('Error uploading voice sample:', response.status, await response.text())
    return false
  }
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const text = formData.get('text') as string
  const voice = formData.get('voice') as string
  const language = (formData.get('language') as string) || 'en'

  console.log('Received request:', { text, voice, language })

  try {
    await dbConnect()

    // Find the voice in the BaseVoice collection
    const voiceCategory = await BaseVoice.findOne({ 'voices.name': voice })
    if (!voiceCategory) {
      throw new Error(`Voice not found: ${voice}`)
    }

    const voiceData = voiceCategory.voices.find(
      (v: { name: string; file_url?: string }) => v.name === voice
    )
    if (!voiceData || !voiceData.file_url) {
      throw new Error(`Voice data or file URL not found for voice: ${voice}`)
    }

    // Download the voice file from the URL
    const voiceResponse = await fetch(voiceData.file_url)
    if (!voiceResponse.ok) {
      throw new Error(`Failed to fetch voice file: ${voiceResponse.statusText}`)
    }
    const voiceBlob = await voiceResponse.blob()

    // Get filename and ensure it has .wav extension
    const originalFilename = path.basename(voiceData.file_url)
    const wavFilename = originalFilename.replace(/\.[^/.]+$/, '.wav')

    // Upload the voice sample to FastAPI server
    const uploadSuccess = await uploadVoiceSample(voiceBlob, wavFilename)
    if (!uploadSuccess) {
      throw new Error('Failed to upload voice sample')
    }

    // Generate TTS audio using FastAPI server
    const response = await fetch(`${BASE_URL}/tts_to_audio/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        speaker_wav: wavFilename,
        language,
      }),
    })

    if (!response.ok) {
      console.error('Error generating audio:', response.status, await response.text())
      return NextResponse.json({ error: 'Failed to generate TTS audio.' }, { status: 500 })
    }

    const contentType = response.headers.get('Content-Type') || 'application/octet-stream'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="generated_audio.wav"',
      },
    })
  } catch (error) {
    console.error('Error in TTS API:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate audio: ' + (error as Error).message,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
