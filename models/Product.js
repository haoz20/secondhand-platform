import mongoose from "mongoose";
import { PRODUCT_CONDITIONS, PRODUCT_CATEGORIES } from "../lib/constants"; // Import constants


const ProductSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
      maxlength: [100, "Product name cannot be more than 100 characters long."],
    },
    description: {
      type: String,
      required: [true, "Product description is required."],
      trim: true,
      maxlength: [1000, "Product description cannot be more than 1000 characters long."],
    },
    imageUrl: {
      type: String,
      required: [true, "Product image URL is required."],
      trim: true,
    },
    condition: {
      type: String,
      required: true,
      enum: PRODUCT_CONDITIONS,
    },
    category: {
      type: String,
      required: true,
      enum : PRODUCT_CATEGORIES,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ seller: 1 });
ProductSchema.index({ category: 1 });

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
