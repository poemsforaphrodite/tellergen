import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BaseVoice from '@/models/BaseVoice';

export async function GET() {
  await dbConnect();

  try {
    const categories = await BaseVoice.find({}).select('category voices._id voices.name voices.file_url voices.is_free');
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ message: 'No voice categories found' }, { status: 404 });
    }

    const formattedCategories = categories.map(category => ({
      _id: category._id,
      category: category.category,
      voices: category.voices.map((voice: { _id: any; name: string; file_url: string; is_free: boolean }) => ({
        _id: voice._id,
        name: voice.name,
        file_url: voice.file_url,
        is_free: voice.is_free
      }))
    }));
    console.log(formattedCategories);
    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching voice categories:', error);
    return NextResponse.json({ error: 'Failed to fetch voice categories' }, { status: 500 });
  }
}
