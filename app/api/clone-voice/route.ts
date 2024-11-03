import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const text = formData.get('text') as string
    const audioFile = formData.get('audio_file') as File | null
    const language = formData.get('language') as string || 'en'

    if (!text || !audioFile) {
      console.error('Missing text or audio file in the request.')
      return NextResponse.json({ error: "Missing text or audio file." }, { status: 400 })
    }

    console.log('Received request:', { text, audioFile: audioFile.name, language })

    // Send request directly to TTS endpoint without separate upload
    const ttsFormData = new FormData()
    ttsFormData.append('voice_file', audioFile, 'voice.wav')
    ttsFormData.append('text', text)
    ttsFormData.append('language', language)

    const response = await fetch(`http://69.158.70.163:43480/tts/`, {
      method: 'POST',
      body: ttsFormData,
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
