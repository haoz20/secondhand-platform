import Product from "@/models/Product";
import Order from "@/models/Order";
import dbConnect from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import crypto from "crypto";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
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
        
        const { id } = await params;
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
}

export async function DELETE(request, { params }) {
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
        
        const { id } = await params;
        
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
        
        // Delete images from Cloudinary if they exist
        if (product.imageUrl && product.imageUrl.length > 0) {
            try {
                const cloudinaryUrls = Array.isArray(product.imageUrl) ? product.imageUrl : [product.imageUrl];
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const apiKey = process.env.CLOUDINARY_API_KEY;
                const apiSecret = process.env.CLOUDINARY_API_SECRET;
                
                // Extract public IDs from Cloudinary URLs and delete them
                for (const url of cloudinaryUrls) {
                    if (url && url.includes('cloudinary.com')) {
                        // Extract public_id from URL
                        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
                        const urlParts = url.split('/upload/');
                        if (urlParts.length > 1) {
                            // Get everything after 'upload/' and remove file extension
                            const pathAfterUpload = urlParts[1];
                            // Remove version number (v1234567890/) if present
                            const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
                            // Remove file extension
                            const publicId = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf('.')) || pathWithoutVersion;
                            
                            console.log(`Attempting to delete Cloudinary image: ${publicId}`);
                            
                            // Generate timestamp for signature
                            const timestamp = Math.round(new Date().getTime() / 1000);
                            
                            // Create signature: SHA1 hash of "public_id={public_id}&timestamp={timestamp}{api_secret}"
                            const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
                            const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');
                            
                            // Call Cloudinary destroy API
                            const formData = new URLSearchParams();
                            formData.append('public_id', publicId);
                            formData.append('timestamp', timestamp.toString());
                            formData.append('api_key', apiKey);
                            formData.append('signature', signature);
                            
                            const cloudinaryResponse = await fetch(
                                `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
                                {
                                    method: 'POST',
                                    body: formData,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                    },
                                }
                            );
                            
                            const result = await cloudinaryResponse.json();
                            
                            if (result.result === 'ok') {
                                console.log(`Successfully deleted Cloudinary image: ${publicId}`);
                            } else {
                                console.log(`Cloudinary deletion result for ${publicId}:`, result);
                            }
                        }
                    }
                }
            } catch (cloudinaryError) {
                console.error('Error deleting Cloudinary images:', cloudinaryError);
                // Continue with product deletion even if Cloudinary deletion fails
            }
        }
        
        // Delete all related orders
        try {
            const deletedOrders = await Order.deleteMany({ product: id });
            console.log(`Deleted ${deletedOrders.deletedCount} related orders for product ${id}`);
        } catch (orderError) {
            console.error('Error deleting related orders:', orderError);
            // Continue with product deletion even if order deletion fails
        }
        
        // Delete the product
        const deletedProduct = await Product.findByIdAndDelete(id);
        return Response.json({ 
            message: 'Product and related orders deleted successfully.',
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