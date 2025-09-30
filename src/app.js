const express=require("express")
const { ProductsManager } = require("./dao/ProductsManager.js")

const PORT=8080
 
const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

ProductsManager.path="./src/data/products.json"

app.get("/", (req, res)=>{

    res.send(`Home Page`)
})

app.get("/products", async(req, res)=>{

    let {cantidad}=req.query

    try {
        let products = await ProductsManager.getProducts()
        if(cantidad){
            products = products.slice(0, cantidad)
            if(isNaN(Number(cantidad)) || Number(cantidad)>products.length ){
                res.send(`Error en la cantidad (no numérica o supera la cantidad de productos, igual a ${products.length})`)
                return 
            }  
        }
    
        res.send(products)
    } catch (error) {
        res.send(`Error while loading products`)
    }
})

app.get("/carts", (req, res)=>{

    res.send(`Carts Page`)
})

const server=app.listen(PORT, ()=>{
    console.log(`Server online in port ${PORT}`)
})
