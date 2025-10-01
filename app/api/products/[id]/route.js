import Product from "@/models/Product";
import dbConnect from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const id = params.id;
        const product = await Product.findById(id).populate('seller', 'username name email');
        
        if (!product) {
            return Response.json(
                { message: 'Product not found.' },
                { status: 404 }
            );
        }
        
        return Response.json(product);
    } catch (error) {
        return Response.json(
            { message: 'Failed to fetch product.' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json(
                { message: 'You must be logged in to update products.' },
                { status: 401 }
            );
        }
        
        const id = params.id;
        const updateData = await request.json();
        
        // Find the product first
        const product = await Product.findById(id);
        if (!product) {
            return Response.json(
                { message: 'Product not found.' },
                { status: 404 }
            );
        }
        
        // Check if the logged-in user is the seller
        if (product.seller.toString() !== session.user.id) {
            return Response.json(
                { message: 'You can only update your own products.' },
                { status: 403 }
            );
        }
        
        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        ).populate('seller', 'username name email');
        
        return Response.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return Response.json(
            { message: 'Failed to update product.' },
            { status: 500 }
        );
    }
}export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json(
                { message: 'You must be logged in to delete products.' },
                { status: 401 }
            );
        }
        
        const id = params.id;
        
        // Find the product first
        const product = await Product.findById(id);
        if (!product) {
            return Response.json(
                { message: 'Product not found.' },
                { status: 404 }
            );
        }
        
        // Check if the logged-in user is the seller
        if (product.seller.toString() !== session.user.id) {
            return Response.json(
                { message: 'You can only delete your own products.' },
                { status: 403 }
            );
        }
        
        // Delete the product
        const deletedProduct = await Product.findByIdAndDelete(id);
        return Response.json({ 
            message: 'Product deleted successfully.',
            product: deletedProduct 
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return Response.json(
            { message: 'Failed to delete product.' },
            { status: 500 }
        );
    }
}