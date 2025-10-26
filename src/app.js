const express = require("express");
const { engine } = require("express-handlebars");
const {Server}=require("socket.io");
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter= require("./routes/views.router.js");
const { ProductsManager } = require("./dao/ProductsManager.js");

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('src/public'));

app.engine("hbs", engine({extname:"hbs", }));
app.set("view engine", "hbs");
app.set("views", "./src/views");

// Server
const serverHTTP = app.listen(PORT, () => {
  console.log(`Server online on port ${PORT}`);
});
const serverSockets = new Server(serverHTTP);

serverSockets.on("connection", async socket=>{
    console.log(`Se ha conectado un cliente con id ${socket.id}`)

    socket.on('new-product', async (productData) => {
        try {
            const newProduct = await ProductsManager.addProduct({
                title: productData.title,
                description: productData.description,
                code: productData.code,
                price: productData.price,
                status: productData.status,
                stock: productData.stock,
                category: productData.category,
                thumbnails: productData.thumbnails
            });

            const products = await ProductsManager.getProducts();
            serverSockets.emit('update-products', products);
        } catch (err) {
            console.log("Error adding producto via websocket", err);
        }
    });

    socket.on("delete-product", async (id) => {
        try {
            await ProductsManager.deleteProduct(id);
            const products = await ProductsManager.getProducts();
            serverSockets.emit("update-products", products);
        } catch (err) {
            console.error("Error deleting product via websocket", err);
        }
    });
})

// Routers
app.use(
    '/api/products', 
    (req, res, next)=>{
        req.socket=serverSockets
        next()
    },
    productsRouter
)
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

