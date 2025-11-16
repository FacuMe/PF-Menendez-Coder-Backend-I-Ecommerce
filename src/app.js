import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import { connDB } from './config/db.js';
import { config } from './config/config.js';
import { ProductsMongoManager } from './dao/ProductsMongoManager.js';
import { CartsMongoManager } from './dao/CartsMongoManager.js';
import { router as productsRouter } from './routes/products.mongo.router.js';
import { router as cartsRouter } from './routes/carts.mongo.router.js';
import viewsRouter from "./routes/views.router.js";

// const productsRouter = require("./routes/products.router.js");
// const cartsRouter = require("./routes/carts.router.js");
// const { ProductsManager } = require("./dao/ProductsManager.js");

const PORT = config.PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('src/public'));

app.engine("hbs", engine({extname:"hbs", }));
app.set("view engine", "hbs");
app.set("views", "./src/views");

// Server
const startServer = async () => {
    await connDB(
        config.database.MONGO_URL,
        config.database.DB_NAME
    )

    const serverHTTP = app.listen(PORT, () => {
    console.log(`Server online on port ${PORT}`);
    });
    const serverSockets = new Server(serverHTTP);

    serverSockets.on("connection", async socket=>{
        console.log(`Se ha conectado un cliente con id ${socket.id}`)

        socket.on('new-product', async (productData) => {
            try {
                const newProduct = await ProductsMongoManager.createProduct({
                    title: productData.title,
                    description: productData.description,
                    code: productData.code,
                    price: productData.price,
                    status: productData.status,
                    stock: productData.stock,
                    category: productData.category,
                    thumbnails: productData.thumbnails
                });

                const products = await ProductsMongoManager.getProducts();
                serverSockets.emit('update-products', products);
            } catch (err) {
                console.log("Error adding product via websocket", err);
                return;
            }
        });

        socket.on("delete-product", async (id) => {
            try {
                await ProductsMongoManager.deleteProduct(id);
                const products = await ProductsMongoManager.getProducts();
                serverSockets.emit("update-products", products);
            } catch (err) {
                console.error("Error deleting product via websocket", err);
                return;
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
}

startServer();