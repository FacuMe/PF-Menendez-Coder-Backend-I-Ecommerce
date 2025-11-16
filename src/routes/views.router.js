import { Router } from "express";
import { ProductsMongoManager } from "../dao/ProductsMongoManager.js";
import { CartsMongoManager } from "../dao/CartsMongoManager.js";

const router = Router();

router.get('/', async(req, res)=>{
    try {
        let products= await ProductsMongoManager.getProducts();

        res.render("home", {
            products
        })
    } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(500).json({error:`Internal server error`});        
    }
});

router.get("/realtimeproducts", async(req, res)=>{
    try {
        let products=await ProductsMongoManager.getProducts();

        res.render("realTimeProducts", {
            products
        })
    } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(500).json({error:`Internal server error`});        
    }
});

router.get("/products/:pid", async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await ProductsMongoManager.getProductsBy({ _id: pid });
        if (!product) return res.status(404).send("Producto no encontrado");

        res.render("productDetail", { product });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/carts/:cid", async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await CartsMongoManager.getCartByIdPopulated(cid);
        if (!cart) return res.status(404).send("Carrito no encontrado");

        res.render("cart", { cart });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;