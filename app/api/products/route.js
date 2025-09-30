import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    await dbConnect();
    const products = await Product.find();
    return Response.json(products);
  } catch (error) {
    return Response.json(
      { message: 'Failed to fetch products.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
    try {
        await dbConnect();
        
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json(
                { message: 'You must be logged in to create products.' },
                { status: 401 }
            );
        }
        
        const body = await request.json();
        
        // Set the seller to the logged-in user
        const productData = {
            ...body,
            seller: session.user.id
        };
        
        const newProduct = new Product(productData);
        await newProduct.save();
        
        // Populate seller info for the response
        await newProduct.populate('seller', 'username name email');
        return Response.json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        return Response.json(
            { message: 'Failed to create product.' },
            { status: 500 }
        );
    }
}


