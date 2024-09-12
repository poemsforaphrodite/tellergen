import { NextResponse } from 'next/server'
import { Client } from '@gradio/client'

export async function POST(request: Request) {
  const formData = await request.formData()
  const text = formData.get('text') as string

  try {
    const client = await Client.connect("nikkmitra/clone")
    const result = await client.predict("/tts_generate", {
      text,
      voice: "Morgan Freeman",
      language: "en",
    })

    if (result && result.data) {
      return NextResponse.json({ audioUrl: result.data })
    } else {
      throw new Error("Failed to generate audio")
    }
  } catch (error) {
    console.error("Error in TTS API:", error)
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 })
  }
}