import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    // Fetch all voices
    const { data: voices, error } = await supabase
      .from('voices')
      .select('category, name, file_url, is_free')
      .order('category');

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: `Database query failed: ${error.message}` }, { status: 500 });
    }

    if (!voices || voices.length === 0) {
      return NextResponse.json({ message: 'No voice categories found' }, { status: 404 });
    }

    // Group voices by category
    const groupedVoices = voices.reduce((acc: any[], voice) => {
      const existingCategory = acc.find(item => item.category === voice.category);
      
      if (existingCategory) {
        existingCategory.voices.push({
          name: voice.name,
          file_url: voice.file_url,
          is_free: voice.is_free
        });
      } else {
        acc.push({
          category: voice.category,
          voices: [{
            name: voice.name,
            file_url: voice.file_url,
            is_free: voice.is_free
          }]
        });
      }
      
      return acc;
    }, []);

    return NextResponse.json(groupedVoices);
  } catch (error) {
    console.error('Error fetching voice categories:', error);
    return NextResponse.json({ error: 'Failed to fetch voice categories' }, { status: 500 });
  }
}