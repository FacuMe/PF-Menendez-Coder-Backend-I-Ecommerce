const fs=require("fs")


class ProductsManager{


    static path="../data/products.json"

    static async addProduct(title, description, code, price, status, stock, category, thumbnails){
        // validaciones
        if(!title || !description || !code || !price || !status || !stock || !category || !thumbnails){
            throw new Error(`title | description | code | price | status | stock | category | thumbnails son requeridos`)
        }

        let products = await this.getProducts()
        let existe = products.find(u=>u.code.toLowerCase()==code.toLowerCase())
        if(existe){
            throw new Error(`Ya existe un producto con el código ${code}: es ${existe.description} - Cod. ${existe.code}`)  
        }

        let id=1
        if(products.length>0){
            id=Math.max(...products.map(d=>d.id))+1
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


}

module.exports={ProductsManager}
