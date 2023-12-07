import ProductDTO from "../dao/DTOs/products.dto.js";

export default class ProductRepository {
    constructor(dao) {
        this.dao = dao
    }

    getProducts = async () => {
        let result = await this.dao.get()
        return result
    }

    createProduct = async (product) => {
        let productToCreate = new ProductDTO(product)
        let result = await this.dao.addProduct(productToCreate)
        return result
    }
}