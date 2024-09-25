import { NextResponse } from 'next/server'
import { Client } from '@gradio/client'

export async function POST(request: Request) {
  const formData = await request.formData()
  const image = formData.get('image') as File
  const audio = formData.get('audio') as File

  console.log('Received request:', { image: image?.name, audio: audio?.name })

  try {
    const client = await Client.connect("nikkmitra/Wav2lip-ZeroGPU")
    console.log('Connected to Gradio client')

    const result = await client.predict("/run_infrence", [
      image,
      audio,
    ])

    console.log('Gradio prediction result:', JSON.stringify(result, null, 2))

    if (result && result.data && result.data[0] && result.data[0].video) {
      const videoData = result.data[0].video
      
      // Check if videoData is an object with a 'url' property
      if (typeof videoData === 'object' && videoData.url) {
        const videoUrl = videoData.url
        
        // Download the video file
        const videoResponse = await fetch(videoUrl)
        if (!videoResponse.ok) {
          throw new Error(`Failed to download video: ${videoResponse.statusText}`)
        }
        const videoBlob = await videoResponse.blob()

        // Convert blob to base64
        const buffer = Buffer.from(await videoBlob.arrayBuffer())
        const base64Video = buffer.toString('base64')

        return NextResponse.json({ videoData: `data:video/mp4;base64,${base64Video}` })
      }
      
      // If it's not an object with a 'url' property, throw an error
      throw new Error("Unexpected video data format")
    } else {
      throw new Error("Failed to generate talking image video: No data in result")
    }
  } catch (error) {
    console.error("Error in Talking Image API:", error)
    return NextResponse.json({ error: "Failed to generate talking image video: " + (error as Error).message }, { status: 500 })
  }
}