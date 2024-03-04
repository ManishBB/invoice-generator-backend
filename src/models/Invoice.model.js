import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
    name: String,
    quantity: Number,
    rate: Number,
});

const InvoiceSchema = new Schema({
    products: [ProductSchema],
    total: Number,
    gst: Number,
    totalWithGst: Number,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Invoice = mongoose.model("Invoice", InvoiceSchema);
