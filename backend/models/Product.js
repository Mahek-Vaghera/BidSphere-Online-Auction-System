import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auction',
        default: null
    },
    name: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true
    },
    condition: { 
        type: String, 
        enum: ["new", "like new", "good", "fair"],
        required: true
    },
    images: [{ 
        type: String 
    }],
    metadata: { 
        type: Object 
    },
    description: { 
        type: String 
    },
});

// Query: search products by name (prefix-based search)
productSchema.index({ name: 1 });

// Query: get all products by category
productSchema.index({ category: 1 });

// Query: filter by condition (new, good, etc.)
productSchema.index({ condition: 1 });

// Query: combined search — filter by category and condition
productSchema.index({ category: 1, condition: 1 });

// Query: text search across name and description
productSchema.index({ name: "text", description: "text" });


const Product = mongoose.model("product", productSchema);

export default Product;