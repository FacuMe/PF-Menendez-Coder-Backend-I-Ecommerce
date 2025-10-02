const express=require("express")
const { ProductsManager } = require("./dao/ProductsManager.js")
const { CartsManager } = require("./dao/CartsManager.js");

const PORT=8080
 
const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

ProductsManager.path="./src/data/products.json"
CartsManager.path="./src/data/carts.json"

//home
app.get("/", (req, res)=>{

    res.send(`Home Page`)
})


//products

function validateId(id) {
  return typeof id === "number" || (typeof id === "string" && !isNaN(Number(id)));
}

function validateProduct(product) {
  if (
    typeof product.title !== "string" ||
    typeof product.description !== "string" ||
    typeof product.code !== "string" ||
    typeof product.category !== "string" ||
    typeof product.price !== "number" ||
    typeof product.stock !== "number" ||
    typeof product.status !== "boolean" ||
    !Array.isArray(product.thumbnails) ||
    !product.thumbnails.every(t => typeof t === "string")
  ) {
    return false;
  }
  return true;
} 

function validatePartialProduct(product) {
  if (!product) return false;
  if (product.title !== undefined && typeof product.title !== "string") return false;
  if (product.description !== undefined && typeof product.description !== "string") return false;
  if (product.code !== undefined && typeof product.code !== "string") return false;
  if (product.category !== undefined && typeof product.category !== "string") return false;
  if (product.price !== undefined && typeof product.price !== "number") return false;
  if (product.stock !== undefined && typeof product.stock !== "number") return false;
  if (product.status !== undefined && typeof product.status !== "boolean") return false;
  if (product.thumbnails !== undefined) {
    if (!Array.isArray(product.thumbnails) || !product.thumbnails.every(t => typeof t === "string")) return false;
  }

  return true;
}

app.get("/products", async(req, res)=>{

    let {cantidad}=req.query

    try {
        let products = await ProductsManager.getProducts()
        if(cantidad){
          if(isNaN(Number(cantidad)) || Number(cantidad)>products.length ){
            res.send({ error: `Quantity error (not a number or greater than the available products: ${products.length})` })
            return 
          }  
          products = products.slice(0, cantidad)
        }
    
        res.send(products)
    } catch (error) {
        res.send({ error: "Error while loading products" })
    }
})


app.get("/products/:pid", async (req, res) => {
  const { pid } = req.params;

  if (!validateId(pid)) {
    return res.send({ error: "Invalid product ID" });
  }

  try {
    const product = await ProductsManager.getProductById(Number(pid));

    if (!product) {
      return res.send({ error: "Product not found" });
    }

    res.send(product);
  } catch (error) {
    res.send({ error: "Error while getting product" });
  }
});

app.post("/products", async (req, res) => {
  const product = req.body;

  if (!validateProduct(product)) {
    return res.send({ error: "Invalid data types" });
  }

  try {
    const newProduct = await ProductsManager.addProduct(product);
    res.send(newProduct);
  } catch (error) {
    res.send({ error: "Error while adding product" });
  }
});

app.put("/products/:pid", async (req, res) => {
  const { pid } = req.params;
  const updates = req.body;

  if (!validateId(pid)) {
    return res.send({ error: "Invalid product ID" });
  }

  if (updates.id !== undefined) delete updates.id;

  if (!validatePartialProduct(updates)) {
    return res.send({ error: "Invalid data types" });
  }

  try {
    const existingProduct = await ProductsManager.getProductById(Number(pid));
    if (!existingProduct) {
      return res.send({ error: "Product not found" });
    }

    const mergeProduct = { ...existingProduct, ...updates };

    const updatedProduct = await ProductsManager.updateProduct(Number(pid), mergeProduct);  

    res.send(updatedProduct);
  } catch (error) {
    res.send({ error: "Error while updating product" });
  }
});

app.delete("/products/:pid", async (req, res) => {
  const { pid } = req.params;

  if (!validateId(pid)) {
    return res.send({ error: "Invalid product ID" });
  }

  try {
    const deleted = await ProductsManager.deleteProduct(Number(pid));

    if (!deleted) {
      return res.send({ error: "Product not found" });
    }

    res.send({ message: "Product deleted successfully" });
  } catch (error) {
    res.send({ error: "Error while deleting product" });
  }
});


//carts
app.get("/carts", (req, res)=>{
    res.send(`Carts Page`)
})

app.post("/carts", async (req, res) => {
    const newCart = await CartsManager.addCart();
    res.send(newCart);
});

app.get("/carts/:cid", async (req, res) => {
    const { cid } = req.params;
    const cart = await CartsManager.getCartById(Number(cid));
    if (!cart) {
      return res.send({ error: "Cart not found" });
    }
    res.send(cart.products);
});

app.post("/carts/:cid/product/:pid", async (req, res) => {
    const { cid, pid } = req.params;

    const product = await ProductsManager.getProductById(Number(pid));
    if (!product) return res.send({ error: "Product not found" });

    const updatedCart = await CartsManager.addProductToCart(Number(cid), Number(pid));
    if (!updatedCart) return res.send({ error: "Cart not found" });

    res.send(updatedCart);
});


//servidor
const server=app.listen(PORT, ()=>{
    console.log(`Server online in port ${PORT}`)
})
