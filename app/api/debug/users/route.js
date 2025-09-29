import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const userCount = await User.countDocuments();
    const users = await User.find({}, 'email username name createdAt').limit(5);
    
    return NextResponse.json({ 
      message: 'Database query successful', 
      userCount,
      users: users.map(user => ({
        email: user.email,
        username: user.username,
        name: user.name,
        createdAt: user.createdAt
      })),
      status: 'ok'
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ 
      message: 'Database query failed', 
      error: error.message,
      status: 'error' 
    }, { status: 500 });
  }
}