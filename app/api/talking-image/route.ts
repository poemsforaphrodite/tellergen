import { NextResponse } from 'next/server'
import { Client } from '@gradio/client'

export async function POST(request: Request) {
  const formData = await request.formData()
  const image = formData.get('image') as File
  const audio = formData.get('audio') as File

  console.log('Received request:', { image: image?.name, audio: audio?.name })

  try {
    // Update the client connection to use the correct space
    const client = await Client.connect("nikkmitra/talking_image")
    console.log('Connected to Gradio client')

    // Update the prediction call with the correct API name and parameters
    const result = await client.predict("/generate_video", [
      image,
      audio,
      "hubert_audio_only", // infer_type
      0, // pose_yaw
      0, // pose_pitch
      0, // pose_roll
      0.5, // face_location
      0.5, // face_scale
      50, // step_T
      true, // face_sr
      0, // seed
    ])

    console.log('Gradio prediction result:', JSON.stringify(result, null, 2))

    if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
      const videoData = result.data[1]?.value?.video // Using the second item (index 1) which contains the SR video
      
      if (videoData && videoData.url) {
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
      
      throw new Error("Unexpected video data format")
    } else {
      throw new Error("Failed to generate talking image video: No data in result")
    }
  } catch (error) {
    console.error("Error in Talking Image API:", error)
    return NextResponse.json({ error: "Failed to generate talking image video: " + (error as Error).message }, { status: 500 })
  }
}
