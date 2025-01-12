import { NextRequest, NextResponse } from 'next/server';
import { client } from "@gradio/client";

const GRADIO_URLS = [
  "https://coqui-xtts.hf.space/",
  "https://coqui-xtts.hf.space/--replicas/kvvgu/",
  "https://coqui-xtts-demo.hf.space/"
];

async function tryPrediction(app: any, inputs: any[]): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Prediction timed out after 30 seconds'));
    }, 30000);

    try {
      const result = await app.predict(1, inputs);
      clearTimeout(timeout);
      resolve(result);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}

async function tryGradioSpaces(inputs: any[]) {
  let lastError = null;
  
  for (const url of GRADIO_URLS) {
    try {
      console.log(`Attempting prediction with URL: ${url}`);
      const app = await client(url);
      const result = await tryPrediction(app, inputs);
      return result;
    } catch (error: any) {
      console.error(`Failed with URL ${url}:`, error?.message || 'Unknown error');
      lastError = error;
      continue;
    }
  }
  
  throw lastError || new Error('All Gradio spaces failed');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const audioFile = formData.get('audio_file') as File;
    const language = formData.get('language') as string || 'en';
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Please upload an audio file.' },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Please provide text to speak.' },
        { status: 400 }
      );
    }

    console.log('Initializing voice clone request:', {
      textLength: text.length,
      audioFileSize: audioFile.size,
      language
    });

    // Convert File to Blob
    let audioBlob;
    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      audioBlob = new Blob([arrayBuffer], { type: audioFile.type });
      console.log('Audio file converted to blob:', {
        blobSize: audioBlob.size,
        blobType: audioBlob.type
      });
    } catch (error: any) {
      console.error('Failed to process audio file:', error);
      return NextResponse.json(
        { error: 'Failed to process audio file. Please try a different file.' },
        { status: 400 }
      );
    }

    // Prepare prediction inputs
    const inputs = [
      text.trim(),
      `${language},${language}`,
      audioBlob,
      audioBlob,
      true,
      true,
      true,
      true
    ];

    // Make prediction using Gradio client with fallback URLs
    console.log('Starting voice clone prediction...');
    const predictionStart = Date.now();
    
    let result;
    try {
      result = await tryGradioSpaces(inputs);
      console.log('Prediction completed in', Date.now() - predictionStart, 'ms');
    } catch (error: any) {
      console.error('All prediction attempts failed:', {
        message: error?.message,
        name: error?.name,
        cause: error?.cause,
        duration: Date.now() - predictionStart
      });
      return NextResponse.json(
        { error: 'Voice cloning service is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    if (!result?.data?.[1]) {
      console.error('Invalid prediction result:', result);
      return NextResponse.json(
        { error: 'Invalid response from voice cloning service' },
        { status: 500 }
      );
    }

    const synthesizedAudio = result.data[1];
    
    if (!synthesizedAudio?.data) {
      console.error('Missing audio data in response:', synthesizedAudio);
      return NextResponse.json(
        { error: 'No audio data generated' },
        { status: 500 }
      );
    }

    // Process audio data
    try {
      const audioData = synthesizedAudio.data.split(',');
      if (audioData.length !== 2) {
        throw new Error('Invalid audio data format');
      }
      
      const audioBuffer = Buffer.from(audioData[1], 'base64');
      console.log('Audio processing completed:', {
        bufferSize: audioBuffer.length
      });

      return new NextResponse(audioBuffer, {
        headers: { 
          'Content-Type': 'audio/wav',
          'Cache-Control': 'no-cache'
        },
      });
    } catch (error: any) {
      console.error('Failed to process generated audio:', error);
      return NextResponse.json(
        { error: 'Failed to process generated audio' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Unexpected voice cloning error:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      cause: error?.cause
    });
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred during voice cloning',
        details: error?.message
      },
      { status: 500 }
    );
  }
}
