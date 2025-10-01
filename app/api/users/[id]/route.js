import User from "@/models/User";
import Product from "@/models/Product";
import Order from "@/models/Order";
import dbConnect from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from 'bcryptjs';

// GET - Get user profile by ID
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const id = params.id;
        
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
        
        const id = params.id;
        
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
        
        const id = params.id;
        
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
        // Delete user's products
        await Product.deleteMany({ seller: id });
        
        // Update orders to mark user as deleted (preserve order history)
        await Order.updateMany(
            { $or: [{ buyer: id }, { seller: id }] },
            { 
                $set: { 
                    'buyer.deleted': true,
                    'seller.deleted': true 
                } 
            }
        );
        
        // Delete the user account
        await User.findByIdAndDelete(id);
        
        return Response.json({
            message: 'Account deleted successfully.',
            deletedProducts: activeProducts,
            affectedOrders: activeOrders
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return Response.json(
            { message: 'Failed to delete account.' },
            { status: 500 }
        );
    }
}