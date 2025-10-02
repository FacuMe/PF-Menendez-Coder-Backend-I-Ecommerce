const fs = require("fs");

class CartsManager {
  
    static path="../data/carts.json"

    static async getCarts() {
        if(fs.existsSync(this.path)){
            let carts = await fs.promises.readFile(this.path, "utf-8")
            if(carts) {
                return JSON.parse(carts)
            }
            return []
        }else{
            return []
        }
    }

    static async getCartById(cid) {
        const carts = await this.getCarts();
        return carts.find(c => Number(c.id) === Number(cid));
    }

    static async addCart() {

        const carts = await this.getCarts();

        let id = 1
        if(carts.length > 0){
            id = Math.max(...carts.map(d=>d.id)) + 1
        }

        let newCart={
            id: id, 
            products: []
        }

        carts.push(newCart);
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 5))
        return newCart
    }

    static async addProductToCart(cid, pid) {
        const carts = await this.getCarts();
        const cart = carts.find(c => Number(c.id) === Number(cid));
        if (!cart) return null;

        let productInCart = cart.products.find(p => Number(p.product) === Number(pid));

        if (productInCart) {
            productInCart.quantity++;
        } else {
            cart.products.push({ product: Number(pid), quantity: 1 });
        }

        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return cart;
        
    }
}

module.exports = { CartsManager };