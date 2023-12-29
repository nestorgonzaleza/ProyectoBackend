export default class ProductDTO {
    constructor(product) {
        this.description = product.description
        this.price = product.price
        this.stock = product.stock
        this.category = product.category
        this.availability = product.availability
        this.owner = product.owner
        // this.image = product.image ******** a agregar con mejora del maquetado
    }
}