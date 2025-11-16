import { Router } from 'express';
import { ProductsMongoManager } from '../dao/ProductsMongoManager.js';
import { isValidObjectId } from 'mongoose';
import { responseError } from '../utils.js';

export const router=Router()

router.get('/',async(req,res)=>{

    try {
        let products = await ProductsMongoManager.getProducts()
        res.setHeader('Content-Type','application/json')
        res.status(200).json({products})
    } catch (error) {
        responseError(error, res)
    }
})

router.get("/:id", async(req, res)=>{
    let {id}=req.params

    if(!isValidObjectId(id)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Inserte un ID de mongoDb válido`})
    }

    try {
        let product = await ProductsMongoManager.getProductsBy({_id:id})
        if (!product) {
            return res.status(404).json({ error: `No existe producto con id ${id}` });
        }
        res.setHeader('Content-Type','application/json');
        return res.status(200).json({product});
    } catch (error) {
        responseError(error, res)
    }
})

router.post("/", async(req, res)=>{
    let {title, description, code, category, price, stock, status, thumbnails} = req.body
    if(!title || !description || !code || !price || !stock || !category){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`titulo, descripción, código de producto, precio, stock y categoría son obligatorios`})
    }

    try {
        let existe = await ProductsMongoManager.getProductsBy({code})
        if(existe){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Ya existe un producto con el código ${code}: ${existe.title}`})
        }

        let newProduct = await ProductsMongoManager.createProduct({title, description, code, category, price, stock, status, thumbnails})

        const products = await ProductsMongoManager.getProducts();
        req.socket.emit('update-products', products);

        res.setHeader('Content-Type','application/json');
        return res.status(201).json({payload:`Producto creado con éxito...!!!`, newProduct});
    } catch (error) {
        responseError(error, res)
    }
})

router.put("/:id", async(req, res)=>{
    let {id} = req.params

    if(!isValidObjectId(id)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Inserte un ID de mongoDb válido`})
    }

    let toModify = req.body

    if(toModify._id){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`No se puede modificar la property _id`})
    }

    try {
        if(toModify.code){
            let existe = await ProductsMongoManager.getProductsBy({code: toModify.code, _id:{$ne:id}})
            if(existe){
                res.setHeader('Content-Type','application/json');
                return res.status(400).json({error:`Ya existe otro producto con el código ${toModify.code}: ${existe.title}`})
            }
        }

        let existe = await ProductsMongoManager.getProductsBy({_id:id})
        if(!existe){
            res.setHeader('Content-Type','application/json');
            return res.status(404).json({error:`No existe producto con id ${id}`})
        }
        let productModified = await ProductsMongoManager.updateProduct(id, toModify)

        res.setHeader('Content-Type','application/json');
        return res.status(200).json({payload:"Producto modificado con éxito...!!!", productModified});
    } catch (error) {
        responseError(error, res)
    }
})


router.delete("/:id", async(req, res)=>{
    let {id} = req.params

    if(!isValidObjectId(id)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Inserte un ID de mongoDb válido`})
    }

    try {
        let existe = await ProductsMongoManager.getProductsBy({_id:id})
        if(!existe){
            res.setHeader('Content-Type','application/json');
            return res.status(404).json({error:`No existe producto con id ${id}`})
        }
        
        let productDeleted = await ProductsMongoManager.deleteProduct(id)
        const products = await ProductsMongoManager.getProducts();
        req.socket.emit('update-products', products);
        res.setHeader('Content-Type','application/json');
        return res.status(200).json({payload:`Producto eliminado...!!!`, productDeleted});
    } catch (error) {
        responseError(error, res)
    }
})
