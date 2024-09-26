import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import VoiceCategory from '@/models/VoiceCategory';

export async function GET() {
  try {
    await dbConnect();
    const categories = await VoiceCategory.find({}).lean();

    // Access the native MongoDB Db object
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch voice categories' }, { status: 500 });
  }
}
