import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { CartsMongoManager } from "../dao/CartsMongoManager.js";
import { responseError } from "../utils.js";

export const router = Router();

router.get("/", async (req, res) => {
    try {
        const carts = await CartsMongoManager.getCarts();
        return res.status(200).json({ carts });
    } catch (error) {
        responseError(error, res);
    }
});


router.get("/:cid", async (req, res) => {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
        return res.status(400).json({ error: "ID de carrito inválido" });
    }

    try {
        const cart = await CartsMongoManager.getCartById(cid);

        if (!cart) {
            return res.status(404).json({ error: `No existe carrito con id ${cid}` });
        }

        return res.status(200).json({ cart });
    } catch (error) {
        responseError(error, res);
    }
});


router.get("/:cid/populated", async (req, res) => {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
        return res.status(400).json({ error: "ID de carrito inválido" });
    }

    try {
        const cart = await CartsMongoManager.getCartByIdPopulated(cid);

        if (!cart) {
            return res.status(404).json({ error: `No existe carrito con id ${cid}` });
        }

        return res.status(200).json({ cart });
    } catch (error) {
        responseError(error, res);
    }
});


router.post("/", async (req, res) => {
    try {
        const newCart = await CartsMongoManager.addCart();
        return res.status(201).json({payload: "Carrito creado con éxito!!!",newCart});
    } catch (error) {
        responseError(error, res);
    }
});


router.post("/:cid/product/:pid", async (req, res) => {
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ error: "ID de carrito y/o producto inválido/s" });
    }

    try {
        const cart = await CartsMongoManager.addProductToCart(cid, pid);

        if (!cart) {
            return res.status(404).json({ error: "Carrito o producto no encontrado" });
        }

        return res.status(200).json({payload: "Producto agregado al carrito", cart});
    } catch (error) {
        responseError(error, res);
    }
});


router.put("/:cid/product/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ error: "ID de carrito y/o producto inválido/s" });
    }

    if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Cantidad inválida" });
    }

    try {
        const cart = await CartsMongoManager.updateProductQuantity(cid, pid, quantity);
        return res.status(200).json({payload: "Cantidad actualizada", cart});
    } catch (error) {
        responseError(error, res);
    }
});


router.delete("/:cid/product/:pid", async (req, res) => {
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ error: "ID de carrito y/o producto inválido/s" });
    }

    try {
        const cart = await CartsMongoManager.deleteProductFromCart(cid, pid);

        return res.status(200).json({payload: "Producto eliminado del carrito", cart});
    } catch (error) {
        responseError(error, res);
    }
});


router.delete("/:cid/products", async (req, res) => {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
        return res.status(400).json({ error: "ID de carrito inválido" });
    }

    try {
        const cart = await CartsMongoManager.emptyCart(cid);

        return res.status(200).json({payload: "Carrito vaciado", cart});
    } catch (error) {
        responseError(error, res);
    }
});

router.delete("/:cid", async (req, res) => {
    let { cid } = req.params;

    if (!isValidObjectId(cid)) {
        return res.status(400).json({ error: "ID de MongoDB del carrito inválido" });
    }

    try {
        const cart = await CartsMongoManager.getCartById(cid);
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }

        const deletedCart = await CartsMongoManager.deleteCart(cid);

        return res.status(200).json({
            message: "Carrito eliminado correctamente",
            deletedCart
        });

    } catch (error) {
        responseError(error, res);
    }
});
