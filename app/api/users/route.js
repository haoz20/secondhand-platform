import User from "@/models/User";
import dbConnect from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - List users (public profiles only)
export async function GET(request) {
    try {
        await dbConnect();
        
        // Get query parameters for pagination and search
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        
        const skip = (page - 1) * limit;
        
        // Build search query
        let query = {};
        if (search) {
            query = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        // Get users without passwords
        const users = await User.find(query)
            .select('-password -email') // Hide sensitive info in public listing
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        const total = await User.countDocuments(query);
        
        return Response.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return Response.json(
            { message: 'Failed to fetch users.' },
            { status: 500 }
        );
    }
}

// POST - This should probably redirect to signup
export async function POST(request) {
    return Response.json(
        { message: 'Use /api/auth/signup to create new accounts.' },
        { status: 405 }
    );
}

// PUT, PATCH, DELETE - Not needed at collection level
export async function PUT(request) {
    return Response.json(
        { message: 'Use /api/users/[id] to update specific users.' },
        { status: 405 }
    );
}

export async function PATCH(request) {
    return Response.json(
        { message: 'Use /api/users/[id] to update specific users.' },
        { status: 405 }
    );
}

export async function DELETE(request) {
    return Response.json(
        { message: 'Use /api/users/[id] to delete specific users.' },
        { status: 405 }
    );
}