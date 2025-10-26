const { Router } = require("express");
const { CartsManager } = require("../dao/CartsManager.js");
const { ProductsManager } = require("../dao/ProductsManager.js");

const router = Router();

ProductsManager.path = "./src/data/products.json";
CartsManager.path = "./src/data/carts.json";

// Validaciones

function validateId(id) {
  return typeof id === "number" || (typeof id === "string" && !isNaN(Number(id)));
}

// Endpoints

router.get("/", (req, res) => {
  res.send("Carts Page");
});

router.post("/", async (req, res) => {
  try {
    const newCart = await CartsManager.addCart();
    res.send(newCart);
  } catch {
    res.send({ error: "Error while creating cart" });
  }
});

router.get("/:cid", async (req, res) => {
  const { cid } = req.params;

  if (!validateId(cid)) return res.send({ error: "Invalid cart ID" });

  try {
    const cart = await CartsManager.getCartById(Number(cid));
    if (!cart) return res.send({ error: "Cart not found" });

    res.send(cart.products);
  } catch {
    res.send({ error: "Error while getting cart" });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  if (!validateId(cid) || !validateId(pid)) return res.send({ error: "Invalid cart ID or product ID" });

  try {
    const product = await ProductsManager.getProductById(Number(pid));
    if (!product) return res.send({ error: "Product not found" });

    const updatedCart = await CartsManager.addProductToCart(Number(cid), Number(pid));
    if (!updatedCart) return res.send({ error: "Cart not found" });

    res.send(updatedCart);
  } catch {
    res.send({ error: "Error while updating cart" });
  }
});

module.exports = router;