import { NextResponse } from 'next/server';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function POST(req: Request) {
  try {
    // Parse the incoming form data
    const formData = await req.formData();
    const text = formData.get('text') as string;
    const voice = formData.get('voice') as string;
    const language = formData.get('language') as string;
    const audioFile = formData.get('audio_file') as File | null;

    // Validate required fields
    if (!text || !voice || !language || !audioFile) {
      return NextResponse.json(
        { error: 'Missing required fields: text, voice, language, or audio_file.' },
        { status: 400 }
      );
    }

    // Prepare the payload for the external API
    const payload = new FormData();
    payload.append('text', text);
    payload.append('voice', voice);
    payload.append('language', language);
    payload.append('audio_file', audioFile, audioFile.name);

    // **Optional: Add headers if your API requires authentication**
    // const headers = {
    //   'Authorization': 'Bearer YOUR_API_TOKEN',
    // };

    // Send the POST request to the external API
    const response = await fetch('https://tellergen.com/api/clone', {
      method: 'POST',
      body: payload,
      // headers, // Uncomment if using headers
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `External API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    // Assuming the external API returns audio data
    const contentType = response.headers.get('Content-Type') || 'audio/mpeg';
    const buffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(buffer);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error in text-to-speech API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
