import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import dbConnect from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from 'bcryptjs';
import crypto from "crypto";

// GET - Get user profile by ID
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        // Find user but exclude password
        const user = await User.findById(id).select('-password');
        
        if (!user) {
            return Response.json(
                { message: 'User not found.' },
                { status: 404 }
            );
        }
        
        return Response.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return Response.json(
            { message: 'Failed to fetch user.' },
            { status: 500 }
        );
    }
}

// PUT - Update user profile
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json(
                { message: 'You must be logged in to update profile.' },
                { status: 401 }
            );
        }
        
        const { id } = await params;
        
        // Check if user is updating their own profile
        if (id !== session.user.id) {
            return Response.json(
                { message: 'You can only update your own profile.' },
                { status: 403 }
            );
        }
        
        const updateData = await request.json();
        const { password, currentPassword, ...otherData } = updateData;
        
        // If password is being updated, verify current password
        if (password) {
            if (!currentPassword) {
                return Response.json(
                    { message: 'Current password is required to change password.' },
                    { status: 400 }
                );
            }
            
            // Get user with password to verify current password
            const user = await User.findById(id);
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            
            if (!isValidPassword) {
                return Response.json(
                    { message: 'Current password is incorrect.' },
                    { status: 400 }
                );
            }
            
            // Hash new password
            const hashedPassword = await bcrypt.hash(password, 10);
            otherData.password = hashedPassword;
        }
        
        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            id,
            otherData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return Response.json(
                { message: 'User not found.' },
                { status: 404 }
            );
        }
        
        return Response.json({
            message: 'Profile updated successfully.',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return Response.json(
                { message: error.message },
                { status: 400 }
            );
        }
        
        // Handle duplicate key errors (unique constraints)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return Response.json(
                { message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` },
                { status: 409 }
            );
        }
        
        return Response.json(
            { message: 'Failed to update profile.' },
            { status: 500 }
        );
    }
}

// DELETE - Delete user account
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json(
                { message: 'You must be logged in to delete account.' },
                { status: 401 }
            );
        }
        
        const { id } = await params;
        
        // Check if user is deleting their own account
        if (id !== session.user.id) {
            return Response.json(
                { message: 'You can only delete your own account.' },
                { status: 403 }
            );
        }
        
        // Find the user first
        const user = await User.findById(id);
        if (!user) {
            return Response.json(
                { message: 'User not found.' },
                { status: 404 }
            );
        }
        
        // Optional: Check if user has active products or orders
        const activeProducts = await Product.countDocuments({ seller: id });
        const activeOrders = await Order.countDocuments({ 
            $or: [{ buyer: id }, { seller: id }] 
        });
        
        // You can choose to either:
        // 1. Prevent deletion if user has active products/orders
        // 2. Delete/transfer the products/orders
        // 3. Just mark them as inactive
        
        // Option 1: Prevent deletion (uncomment if you want this behavior)
        /*
        if (activeProducts > 0 || activeOrders > 0) {
            return Response.json(
                { 
                    message: 'Cannot delete account with active products or orders. Please remove them first.',
                    activeProducts,
                    activeOrders
                },
                { status: 400 }
            );
        }
        */
        
        // Option 2: Clean up related data (recommended)
        // Get all user's products to delete their images and orders
        const userProducts = await Product.find({ seller: id });
        const productIds = userProducts.map(p => p._id);
        
        // Delete all orders related to user's products
        await Order.deleteMany({ product: { $in: productIds } });
        
        // Delete all orders where user is a buyer
        await Order.deleteMany({ buyer: id });
        
        // Delete images from Cloudinary
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        
        for (const product of userProducts) {
            if (product.imageUrl && product.imageUrl.length > 0) {
                try {
                    const cloudinaryUrls = Array.isArray(product.imageUrl) ? product.imageUrl : [product.imageUrl];
                    
                    for (const url of cloudinaryUrls) {
                        if (url && url.includes('cloudinary.com')) {
                            // Extract public_id from URL
                            const urlParts = url.split('/upload/');
                            if (urlParts.length > 1) {
                                const pathAfterUpload = urlParts[1];
                                const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
                                const publicId = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf('.')) || pathWithoutVersion;
                                
                                console.log(`Attempting to delete Cloudinary image: ${publicId}`);
                                
                                // Generate timestamp for signature
                                const timestamp = Math.round(new Date().getTime() / 1000);
                                
                                // Create signature
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
                    console.error(`Error deleting Cloudinary images for product ${product._id}:`, cloudinaryError);
                    // Continue with deletion even if Cloudinary fails
                }
            }
        }
        
        // Delete user's products
        await Product.deleteMany({ seller: id });
        
        // Delete the user account
        await User.findByIdAndDelete(id);
        
        return Response.json({
            message: 'Account and all related data deleted successfully.',
            deletedProducts: userProducts.length,
            note: 'All products, orders, and associated data have been removed.'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return Response.json(
            { message: 'Failed to delete account.' },
            { status: 500 }
        );
    }
}