import { NextResponse } from 'next/server'

// FastAPI Server Configuration
const FASTAPI_SERVER_IP = '39.114.73.97'
const FASTAPI_PORT = '34123'
const FASTAPI_BASE_URL = `http://${FASTAPI_SERVER_IP}:${FASTAPI_PORT}`

async function uploadVoiceSample(file: File | Blob): Promise<string> {
  const formData = new FormData()
  // Generate a unique filename with .wav extension
  const uniqueFilename = `voice_${Date.now()}.wav`
  formData.append('wavFile', file, uniqueFilename)

  const response = await fetch(`${FASTAPI_BASE_URL}/upload_sample`, {
    method: 'POST',
    body: formData,
  })

  if (response.ok) {
    console.log('Voice sample uploaded successfully')
    return uniqueFilename
  } else {
    console.error('Error uploading voice sample:', response.status, await response.text())
    throw new Error('Failed to upload voice sample')
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const text = formData.get('text') as string
    const audioFile = formData.get('audio_file') as File | null

    if (!text || !audioFile) {
      console.error('Missing text or audio file in the request.')
      return NextResponse.json({ error: "Missing text or audio file." }, { status: 400 })
    }

    console.log('Received request:', { text, audioFile: audioFile.name })

    // Upload the voice sample and get the server-side filename
    const serverFilename = await uploadVoiceSample(audioFile)

    // Generate TTS audio using FastAPI server
    const response = await fetch(`${FASTAPI_BASE_URL}/tts_to_audio/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        speaker_wav: serverFilename,  // Use the server-side filename
        language: 'en',
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
    console.error("Error in Clone Voice API:", error)
    return NextResponse.json(
      { error: "Failed to clone voice: " + (error as Error).message },
      { status: 500 }
    )
  }
}
