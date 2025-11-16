import { Router } from "express";
import { ProductsMongoManager } from "../dao/ProductsMongoManager.js";

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
})

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
})


export default router;