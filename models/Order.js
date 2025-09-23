import mongoose from "mongoose";
import { ORDER_STATUSES } from "@/lib/constants";
const OrderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ORDER_STATUSES,
    required: true,
  }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
