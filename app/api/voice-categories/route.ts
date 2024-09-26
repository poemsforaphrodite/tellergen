import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import VoiceCategory from '@/models/VoiceCategory';

export async function GET() {
  console.log('Voice categories API route called');
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connection successful');

    console.log('Fetching voice categories from database...');
    const categories = await VoiceCategory.find({}).lean();
    console.log('Raw categories data:', categories);
    console.log('Fetched voice categories:', JSON.stringify(categories, null, 2));
    console.log('Number of categories found:', categories.length);

    if (categories.length === 0) {
      console.log('No voice categories found in the database');
      console.log('Checking VoiceCategory model:', VoiceCategory);
      console.log('Checking collection name:', VoiceCategory.collection.name);
    } else {
      console.log('Categories found. Sampling first category:');
      console.log(JSON.stringify(categories[0], null, 2));
    }

    // Access the native MongoDB Db object
    const db = mongoose.connection.db;
    if (db) {
      console.log('Current database:', db.databaseName);
      console.log('VoiceCategory collection:', VoiceCategory.collection.name);
    } else {
      console.error('Database connection not established');
    }

    // Use non-null assertion operator
    const collections = await db!.listCollections().toArray();
    console.log('All collections in the database:', collections.map((c) => c.name));

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in voice categories API:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to fetch voice categories' }, { status: 500 });
  }
}
