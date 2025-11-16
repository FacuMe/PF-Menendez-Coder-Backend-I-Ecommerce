import mongoose from "mongoose";

const productsSchema=new mongoose.Schema(
    {
        title: {
            type: String,
            unique: true, 
            required: true
        },
        description: {
            type: String,  
            required: true
        }, 
        code: {
            type: String, 
            unique: true, 
            required: true
        }, 
        price: {
            type: Number,  
            required: true
        }, 
        status: {
            type: Boolean,  
            default: true
        },
        stock: {
            type: Number,  
            required: true
        },
        category: {
            type: String,  
            required: true
        },
        thumbnails: {
            type: [String],  
            default: []
        }
    },
    {
        timestamps: true,
        // strict: false,
    }
);

export const productsModel=mongoose.model(
    "products", 
    productsSchema
);
