import ProductDTO from "../dao/DTOs/products.dto.js";

export default class ProductRepository {
    constructor(dao) {
        this.dao = dao
    }
    
    createProduct = async (product) => {
        let productToCreate = new ProductDTO(product)
        let result = await this.dao.addProduct(productToCreate)
        return result
    }
    getProducts = async () => {
        let result = await this.dao.get()
        return result
    }

}