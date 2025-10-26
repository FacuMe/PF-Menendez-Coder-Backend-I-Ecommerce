const { Router } = require("express");
const { ProductsManager } = require("../dao/ProductsManager.js");
const router = Router();
ProductsManager.path = "./src/data/products.json";


//Validaciones

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

//Endpoints

router.get("/", async (req, res) => {
  let { cantidad } = req.query;

  try {
    let products = await ProductsManager.getProducts();

    if (cantidad) {
      if (isNaN(Number(cantidad)) || Number(cantidad) > products.length) {
        return res.send({ error: `Quantity error (not a number or greater than available: ${products.length})` });
      }
      products = products.slice(0, cantidad);
    }

    res.send(products);
  } catch (error) {
    res.send({ error: "Error while loading products" });
  }
});

router.get("/:pid", async (req, res) => {
  const { pid } = req.params;

  if (!validateId(pid)) return res.send({ error: "Invalid product ID" });

  try {
    const product = await ProductsManager.getProductById(Number(pid));
    if (!product) return res.send({ error: "Product not found" });

    res.send(product);
  } catch {
    res.send({ error: "Error while getting product" });
  }
});

router.post("/", async (req, res) => {
  const product = req.body;

  if (!validateProduct(product)) return res.send({ error: "Invalid data types" });

  try {
    const newProduct = await ProductsManager.addProduct(product);

    const products = await ProductsManager.getProducts();
    req.socket.emit('update-products', products);

    res.send(newProduct);
  } catch {
    res.send({ error: "Error while adding product" });
  }
});

router.put("/:pid", async (req, res) => {
  const { pid } = req.params;
  const updates = req.body;

  if (!validateId(pid)) return res.send({ error: "Invalid product ID" });
  if (updates.id !== undefined) delete updates.id;
  if (!validatePartialProduct(updates)) return res.send({ error: "Invalid data types" });

  try {
    const existingProduct = await ProductsManager.getProductById(Number(pid));
    if (!existingProduct) return res.send({ error: "Product not found" });

    const mergedProduct = { ...existingProduct, ...updates };
    const updatedProduct = await ProductsManager.updateProduct(Number(pid), mergedProduct);

    res.send(updatedProduct);
  } catch {
    res.send({ error: "Error while updating product" });
  }
});

router.delete("/:pid", async (req, res) => {
  const { pid } = req.params;

  if (!validateId(pid)) return res.send({ error: "Invalid product ID" });

  try {
    const deleted = await ProductsManager.deleteProduct(Number(pid));
    if (!deleted) return res.send({ error: "Product not found" });

    const products = await ProductsManager.getProducts();
    req.socket.emit('update-products', products);

    res.send({ message: "Product deleted successfully" });
  } catch {
    res.send({ error: "Error while deleting product" });
  }
});

module.exports = router;
