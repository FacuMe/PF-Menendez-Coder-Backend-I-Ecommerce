import { productsModel } from "./models/productsModel.js";

export class ProductsMongoManager{
    static async getProducts(filter={}){
        return await productsModel.find(filter).lean();
    }

    static async getProductsBy(filter={}){
        return await productsModel.findOne(filter).lean();
    }

    static async createProduct(product){
        let newProduct=await productsModel.create(product);
        return newProduct.toJSON();
    }

    static async updateProduct(id, toModify={}){
        return await productsModel.findByIdAndUpdate(id, toModify, {new: true}).lean();
    }

    static async deleteProduct(id){
        return await productsModel.findByIdAndDelete(id).lean();
    }

    static getPaginatedProducts(filter, options) {
        return productsModel.paginate(filter, options);
    }
}
