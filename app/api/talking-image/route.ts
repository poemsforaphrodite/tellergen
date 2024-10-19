import { NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import User from '@/models/User'
import dbConnect from '@/lib/mongodb'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

async function getBase64FromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

async function waitForReplicateJob(jobId: string): Promise<any> {
  const maxAttempts = 60; // Maximum number of attempts (10 minutes with 10-second intervals)
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`${REPLICATE_API_URL}/${jobId}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'succeeded') {
      return result;
    } else if (result.status === 'failed') {
      throw new Error('Job failed: ' + (result.error || 'Unknown error'));
    }

    // Wait for 10 seconds before the next attempt
    await new Promise(resolve => setTimeout(resolve, 10000));
    attempts++;
  }

  throw new Error('Job timed out');
}

export async function POST(request: Request) {
  await dbConnect()

  const userId = getUserIdFromRequest()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const image = formData.get('image') as File
  const audio = formData.get('audio') as File

  console.log('Received request:', { image: image?.name, audio: audio?.name })

  try {
    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const imageBase64 = await getBase64FromFile(image);
    const audioBase64 = await getBase64FromFile(audio);

    const response = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "a519cc0cfebaaeade068b23899165a11ec76aaa1d2b313d40d214f204ec957a3",
        input: {
          driven_audio: `data:audio/wav;base64,${audioBase64}`,
          source_image: `data:image/png;base64,${imageBase64}`,
          use_enhancer: true,
          preprocess: "full",
          size_of_image: 512
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const initialResult = await response.json();
    console.log('Initial Replicate API response:', initialResult);

    // Wait for the job to complete
    const finalResult = await waitForReplicateJob(initialResult.id);
    console.log('Final Replicate API response:', finalResult);

    if (finalResult.status === 'succeeded' && finalResult.output) {
      const videoUrl = finalResult.output;
      
      // Download the video file
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
      }
      const videoBlob = await videoResponse.blob();

      // Convert blob to base64
      const buffer = Buffer.from(await videoBlob.arrayBuffer());
      const base64Video = buffer.toString('base64');

      return NextResponse.json({ 
        videoData: `data:video/mp4;base64,${base64Video}`
      });
    } else {
      throw new Error("Failed to generate talking image video: " + (finalResult.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error in Talking Image API:", error);
    return NextResponse.json({ error: "Failed to generate talking image video: " + (error as Error).message }, { status: 500 });
  }
}
