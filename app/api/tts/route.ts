import { NextResponse } from 'next/server'
import { Client } from '@gradio/client'

export async function POST(request: Request) {
  const formData = await request.formData()
  const text = formData.get('text') as string
  const voice = formData.get('voice') as string
  const language = formData.get('language') as string

  console.log('Received request:', { text, voice, language })

  try {
    const client = await Client.connect("nikkmitra/clone")
    console.log('Connected to Gradio client')

    const result = await client.predict("/tts_generate", {
      text,
      voice,
      language,
    })

    console.log('Gradio prediction result:', result)

    if (result && result.data && result.data[0] && result.data[0].url) {
      const audioUrl = result.data[0].url
      
      // Download the audio file
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) {
        throw new Error(`Failed to download audio: ${audioResponse.statusText}`)
      }
      const audioBlob = await audioResponse.blob()

      // Convert blob to base64
      const buffer = Buffer.from(await audioBlob.arrayBuffer())
      const base64Audio = buffer.toString('base64')

      return NextResponse.json({ audioData: `data:audio/wav;base64,${base64Audio}` })
    } else {
      throw new Error("Failed to generate audio: No data in result")
    }
  } catch (error) {
    console.error("Error in TTS API:", error)
    return NextResponse.json({ error: "Failed to generate audio: " + (error as Error).message }, { status: 500 })
  }
}