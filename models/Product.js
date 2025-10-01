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
    year: {
      type: Number,
      required: [true, "Year of manufacture is required."],
      min: [1900, "Year must be between 1900 and the current year."],
      max: [new Date().getFullYear(), "Year must be between 1900 and the current year."],
    },
    imageUrl: {
      type: [String],
      required: [true, "Product image URL is required."],
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one product image is required.'
      }
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

// Delete the model from cache if it exists to avoid schema conflicts
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const Product = mongoose.model("Product", ProductSchema);

export default Product;
