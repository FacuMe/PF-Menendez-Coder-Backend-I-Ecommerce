const fs=require("fs")

class ProductsManager{

    static path="../data/products.json"

    static async getProducts(){
        if(fs.existsSync(this.path)){
            let products=JSON.parse(await fs.promises.readFile(this.path, "utf-8"))
            products=products.map(u=>{
                return {
                    ...u, 
                    title: u.title.toUpperCase()
                }
            })
            return products
        }else{
            return []
        }
    }

    static async getProductById(id) {
        const products = await this.getProducts();
        const product = products.find((p) => Number(p.id) === Number(id));
        return product;
    }

    static async addProduct(product){
        const { title, description, code, price, status, stock, category, thumbnails } = product;

        if(!title || !description || !code || !price || status === undefined || !stock || !category || !thumbnails){
            throw new Error(`title | description | code | price | status | stock | category | thumbnails are required`)
        }

        let products = await this.getProducts()
        let existe = products.find(u=>u.code.toLowerCase()==code.toLowerCase())
        if(existe){
            throw new Error(`A product with code ${code} already exists: ${existe.description}`)  
        }

        let id = 1
        if(products.length > 0){
            id = Math.max(...products.map(d=>d.id)) + 1
        }

        let newProduct={
            id, 
            title, 
            description, 
            code, 
            price, 
            status, 
            stock, 
            category, 
            thumbnails
        }

        products.push(newProduct)

        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5))

        return newProduct
    }

    static async updateProduct(id, updates) {
        let products = await this.getProducts();

        products = products.map(p => {
            if (p.id == id) {
            updates.id = p.id; 
            return updates;     
            }
            return p;
        });

        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5));
        return updates;
    }

    static async deleteProduct(id) {
        let products = await this.getProducts();
        let initialLength = products.length;

        products = products.filter(p => p.id != id); 

        if (products.length === initialLength) {
            return false;
        }

        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5));
        return true;
    }

}

module.exports={ProductsManager}
