import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import BaseVoice from '@/models/BaseVoice'
import fetch from 'node-fetch'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

interface ReplicateResponse {
  id: string;
  // Add other properties as needed
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

    if (typeof result === 'object' && result !== null && 'status' in result) {
      if (result.status === 'succeeded') {
        return result;
      } else if (result.status === 'failed') {
        throw new Error('Job failed: ' + ((result as any).error || 'Unknown error'));
      }
    }

    // Wait for 10 seconds before the next attempt
    await new Promise(resolve => setTimeout(resolve, 10000));
    attempts++;
  }

  throw new Error('Job timed out');
}

async function fetchAndConvertToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const text = formData.get('text') as string
  const voice = formData.get('voice') as string
  const language = formData.get('language') as string

  console.log('Received request:', { text, voice, language })

  try {
    await dbConnect();

    // Find the voice in the BaseVoice collection
    const voiceCategory = await BaseVoice.findOne({ 'voices.name': voice });
    if (!voiceCategory) {
      throw new Error(`Voice not found: ${voice}`);
    }

    const voiceData = voiceCategory.voices.find((v: { name: string; file_url?: string }) => v.name === voice);
    if (!voiceData || !voiceData.file_url) {
      throw new Error(`Voice data or file URL not found for voice: ${voice}`);
    }

    // Fetch the audio file and convert it to base64
    const base64Audio = await fetchAndConvertToBase64(voiceData.file_url);

    const response = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
        input: {
          speaker: `data:audio/wav;base64,${base64Audio}`,
          text: text,
          language: language,
          cleanup_voice: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const initialResult = await response.json() as ReplicateResponse;
    console.log('Initial Replicate response:', initialResult);

    // Wait for the job to complete
    const finalResult = await waitForReplicateJob(initialResult.id);
    console.log('Final Replicate result:', finalResult);

    if (finalResult.output && typeof finalResult.output === 'string' && finalResult.output.startsWith('http')) {
      console.log('Returning audio URL:', finalResult.output);
      return NextResponse.json({ audioUrl: finalResult.output });
    } else {
      console.error('Invalid output from Replicate:', finalResult);
      throw new Error("Failed to generate audio: Invalid output from Replicate");
    }
  } catch (error) {
    console.error("Error in TTS API:", error);
    return NextResponse.json({ 
      error: "Failed to generate audio: " + (error as Error).message,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
