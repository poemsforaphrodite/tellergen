import { NextResponse } from 'next/server'

// Replicate API Configuration
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

async function getBase64FromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const base64 = Buffer.from(uint8Array).toString('base64');
  return `data:${file.type};base64,${base64}`;
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

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const text = formData.get('text') as string
    const audioFile = formData.get('audio_file') as File | null

    if (!text || !audioFile) {
      console.error('Missing text or audio file in the request.');
      return NextResponse.json({ error: "Missing text or audio file." }, { status: 400 })
    }

    console.log('Received request:', { text, audioFile: audioFile.name })

    const audioBase64 = await getBase64FromFile(audioFile);

    console.log('Preparing Replicate API request')

    const response = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
        input: {
          speaker: audioBase64,
          text: text,
          language: "en",
          cleanup_voice: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const initialResult = await response.json();
    console.log('Initial Replicate response:', initialResult);

    // Wait for the job to complete
    const finalResult = await waitForReplicateJob(initialResult.id);
    console.log('Final Replicate result:', finalResult);

    if (finalResult.output && typeof finalResult.output === 'string' && finalResult.output.startsWith('http')) {
      console.log('Returning audio URL:', finalResult.output);
      return NextResponse.json({ audioUrl: finalResult.output });
    } else {
      console.error('Invalid output from Replicate:', finalResult);
      throw new Error("Failed to clone voice: Invalid output from Replicate");
    }
  } catch (error) {
    console.error("Error in Clone Voice API:", error);
    return NextResponse.json({ error: "Failed to clone voice: " + (error as Error).message }, { status: 500 });
  }
}
