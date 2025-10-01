import Order from "@/models/Order";
import Product from "@/models/Product";
import dbConnect from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Get orders for the logged-in user (both as buyer and seller)
export async function GET(request) {
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
        
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role'); // 'buyer', 'seller', or 'all' (default)
        const status = searchParams.get('status'); // filter by order status
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        
        const skip = (page - 1) * limit;
        
        // Build query based on role
        let query = {};
        if (role === 'buyer') {
            query.buyer = session.user.id;
        } else if (role === 'seller') {
            // Need to find orders where the user is the seller of the product
            const userProducts = await Product.find({ seller: session.user.id }).select('_id');
            const productIds = userProducts.map(p => p._id);
            query.product = { $in: productIds };
        } else {
            // Get all orders where user is either buyer or seller
            const userProducts = await Product.find({ seller: session.user.id }).select('_id');
            const productIds = userProducts.map(p => p._id);
            query.$or = [
                { buyer: session.user.id },
                { product: { $in: productIds } }
            ];
        }
        
        // Add status filter if provided
        if (status) {
            query.status = status;
        }
        
        const orders = await Order.find(query)
            .populate('buyer', 'username name email')
            .populate({
                path: 'product',
                populate: {
                    path: 'seller',
                    select: 'username name email'
                }
            })
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Order.countDocuments(query);
        
        return Response.json({
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return Response.json(
            { message: 'Failed to fetch orders.' },
            { status: 500 }
        );
    }
}

// POST - Create a new order (buy a product)
export async function POST(request) {
    try {
        await dbConnect();
        
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json(
                { message: 'You must be logged in to create orders.' },
                { status: 401 }
            );
        }
        
        const { productId, status = 'pending' } = await request.json();
        
        if (!productId) {
            return Response.json(
                { message: 'Product ID is required.' },
                { status: 400 }
            );
        }
        
        // Check if product exists
        const product = await Product.findById(productId).populate('seller', 'username name email');
        if (!product) {
            return Response.json(
                { message: 'Product not found.' },
                { status: 404 }
            );
        }
        
        // Prevent users from buying their own products
        if (product.seller._id.toString() === session.user.id) {
            return Response.json(
                { message: 'You cannot buy your own product.' },
                { status: 400 }
            );
        }
        
        // Check if user already has a pending order for this product
        const existingOrder = await Order.findOne({
            buyer: session.user.id,
            product: productId,
            status: { $in: ['pending', 'confirmed'] }
        });
        
        if (existingOrder) {
            return Response.json(
                { message: 'You already have an active order for this product.' },
                { status: 400 }
            );
        }
        
        // Create the order
        const orderData = {
            buyer: session.user.id,
            product: productId,
            status: status
        };
        
        const newOrder = new Order(orderData);
        await newOrder.save();
        
        // Populate the order with buyer and product details
        await newOrder.populate([
            { path: 'buyer', select: 'username name email' },
            { 
                path: 'product',
                populate: { path: 'seller', select: 'username name email' }
            }
        ]);
        
        return Response.json({
            message: 'Order created successfully.',
            order: newOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return Response.json(
            { message: 'Failed to create order.' },
            { status: 500 }
        );
    }
}