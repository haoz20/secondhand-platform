import Order from "@/models/Order";
import Product from "@/models/Product";
import dbConnect from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Get specific order by ID
export async function GET(request, { params }) {
    try {
        await dbConnect();
        
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json(
                { message: 'You must be logged in to view orders.' },
                { status: 401 }
            );
        }
        
        const { id: orderId } = await params;
        
        const order = await Order.findById(orderId)
            .populate('buyer', 'username name email')
            .populate({
                path: 'product',
                populate: {
                    path: 'seller',
                    select: 'username name email'
                }
            });
        
        if (!order) {
            return Response.json(
                { message: 'Order not found.' },
                { status: 404 }
            );
        }
        
        // Check if user is authorized to view this order (buyer or seller)
        const isBuyer = order.buyer._id.toString() === session.user.id;
        const isSeller = order.product.seller._id.toString() === session.user.id;
        
        if (!isBuyer && !isSeller) {
            return Response.json(
                { message: 'You are not authorized to view this order.' },
                { status: 403 }
            );
        }
        
        return Response.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return Response.json(
            { message: 'Failed to fetch order.' },
            { status: 500 }
        );
    }
}

// PUT - Update order status
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json(
                { message: 'You must be logged in to update orders.' },
                { status: 401 }
            );
        }
        
        const { id: orderId } = await params;
        const { status } = await request.json();
        
        if (!status) {
            return Response.json(
                { message: 'Status is required.' },
                { status: 400 }
            );
        }
        
        // Find the order first
        const order = await Order.findById(orderId)
            .populate('buyer', 'username name email')
            .populate({
                path: 'product',
                populate: {
                    path: 'seller',
                    select: 'username name email'
                }
            });
        
        if (!order) {
            return Response.json(
                { message: 'Order not found.' },
                { status: 404 }
            );
        }
        
        // Check authorization and allowed status transitions
        const isBuyer = order.buyer._id.toString() === session.user.id;
        const isSeller = order.product.seller._id.toString() === session.user.id;
        
        if (!isBuyer && !isSeller) {
            return Response.json(
                { message: 'You are not authorized to update this order.' },
                { status: 403 }
            );
        }
        
        // Define allowed status transitions based on role
        const allowedTransitions = {
            buyer: {
                pending: ['cancelled'],
                confirmed: ['cancelled'], // buyer can cancel even confirmed orders
                cancelled: [] // cannot change from cancelled
            },
            seller: {
                pending: ['confirmed', 'cancelled'],
                confirmed: [],
                cancelled: []
            }
        };
        
        const userRole = isBuyer ? 'buyer' : 'seller';
        const currentStatus = order.status;
        
        if (!allowedTransitions[userRole][currentStatus]?.includes(status)) {
            return Response.json(
                { 
                    message: `As a ${userRole}, you cannot change order status from ${currentStatus} to ${status}.`,
                    allowedStatuses: allowedTransitions[userRole][currentStatus] || []
                },
                { status: 400 }
            );
        }
        
        // Update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate([
            { path: 'buyer', select: 'username name email' },
            { 
                path: 'product',
                populate: { path: 'seller', select: 'username name email' }
            }
        ]);
        
        return Response.json({
            message: 'Order status updated successfully.',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return Response.json(
            { message: 'Failed to update order.' },
            { status: 500 }
        );
    }
}

// DELETE - Cancel/Delete order (only if pending)
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json(
                { message: 'You must be logged in to delete orders.' },
                { status: 401 }
            );
        }
        
        const { id: orderId } = await params;
        
        // Find the order first
        const order = await Order.findById(orderId)
            .populate('product', 'seller');
        
        if (!order) {
            return Response.json(
                { message: 'Order not found.' },
                { status: 404 }
            );
        }
        
        // Check authorization (only buyer can delete their orders)
        const isBuyer = order.buyer.toString() === session.user.id;
        
        if (!isBuyer) {
            return Response.json(
                { message: 'Only the buyer can delete their order.' },
                { status: 403 }
            );
        }
        
        // Only allow deletion if order is pending
        if (order.status !== 'pending') {
            return Response.json(
                { message: 'Only pending orders can be deleted.' },
                { status: 400 }
            );
        }
        
        // Delete the order
        await Order.findByIdAndDelete(orderId);
        
        return Response.json({
            message: 'Order deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        return Response.json(
            { message: 'Failed to delete order.' },
            { status: 500 }
        );
    }
}
