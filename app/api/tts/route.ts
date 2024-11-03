import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import NewVoice from '@/models/NewVoice'
import fetch from 'node-fetch'
import path from 'path'


export async function POST(request: Request) {
  const formData = await request.formData()
  const text = formData.get('text') as string
  const voice = formData.get('voice') as string
  const language = (formData.get('language') as string) || 'en'

  console.log('Received request:', { text, voice, language })

  try {
    await dbConnect()

    // Find the voice in the BaseVoice collection
    const voiceCategory = await NewVoice.findOne({ 'voices.name': voice })
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

    // Modified API call structure to match the example
    const response = await fetch(`http://69.158.70.163:43480/tts/`, {
      method: 'POST',
      body: (() => {
        const formData = new FormData()
        formData.append('voice_file', voiceBlob, wavFilename)
        formData.append('text', text)
        formData.append('language', language)
        return formData
      })(),
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
