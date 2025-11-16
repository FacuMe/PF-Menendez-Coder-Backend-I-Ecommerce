import { cartsModel } from "./models/cartsModel.js";

export class CartsMongoManager {

    static async getCarts() {
        return await cartsModel.find().lean();
    }

    static async addCart() {
        const newCart = await cartsModel.create({ products: [] });
        return newCart.toJSON();
    }

    static async getCartById(cid) {
        return await cartsModel.findById(cid).lean();
    }

    static async getCartByIdPopulated(cid) {
        return await cartsModel
            .findById(cid)
            .populate("products.product")
            .lean();
    }

    static async addProductToCart(cid, pid) {
        const cart = await cartsModel.findById(cid);

        if (!cart) return null;

        const productInCart = cart.products.find(
            p => p.product.toString() === pid
        );

        if (productInCart) {
            productInCart.quantity++;
        } else {
            cart.products.push({
                product: pid,
                quantity: 1
            });
        }

        await cart.save();
        return cart.toJSON();
    }

    static async updateProductQuantity(cid, pid, quantity) {
        return await cartsModel.findOneAndUpdate(
            { _id: cid, "products.product": pid },
            { $set: { "products.$.quantity": quantity } },
            { new: true }
        ).lean();
    }

    static async deleteProductFromCart(cid, pid) {
        return await cartsModel.findByIdAndUpdate(
            cid,
            { $pull: { products: { product: pid } } },
            { new: true }
        ).lean();
    }

    static async emptyCart(cid) {
        return await cartsModel.findByIdAndUpdate(
            cid,
            { $set: { products: [] } },
            { new: true }
        ).lean();
    }

    static async deleteCart(cid) {
        return await cartsModel.findByIdAndDelete(cid);
    }
}