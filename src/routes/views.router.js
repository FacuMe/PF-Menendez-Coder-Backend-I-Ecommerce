const { ProductsManager } = require('../dao/ProductsManager.js');

const Router=require('express').Router;
const router=Router();

router.get('/', async(req, res)=>{
    try {
        let products= await ProductsManager.getProducts();

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
        let products=await ProductsManager.getProducts();

        res.render("realTimeProducts", {
            products
        })
    } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(500).json({error:`Internal server error`});        
    }
})


module.exports=router;