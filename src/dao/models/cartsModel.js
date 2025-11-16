import mongoose from "mongoose";

const cartsSchema=new mongoose.Schema(
    {
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products", 
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

export const cartsModel=mongoose.model(
    "carts", 
    cartsSchema
);
