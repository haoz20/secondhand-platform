import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ 
      message: 'Database connected successfully', 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      message: 'Database connection failed', 
      error: error.message,
      status: 'error' 
    }, { status: 500 });
  }
}