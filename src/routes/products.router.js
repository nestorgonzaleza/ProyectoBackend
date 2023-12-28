import { Router } from "express";
import Products from "../dao/mongo/products.mongo.js"
import ProductDTO from "../dao/DTOs/products.dto.js";
import { productService, userService } from "../repositories/pivot.js";
import logger from "../logger.js";
const router = Router()

const productMongo = new Products()

router.get("/", async (req, res) => {
    req.logger.info('Cargando productos');
    let result = await productMongo.get()
    res.send({ status: "success", payload: result })

})

router.post("/", async (req, res) => {

    let { description, price, stock, category, availability, owner } = req.body  //aqui irá también image con la mejora del maquetado

    if(owner === undefined || owner == ''){
        owner = 'admin@admin.cl'
    }

    const product = { description, price, stock, category, availability, owner} //aqui irá también image con la mejora del maquetado

    if (!description || !price) {
        try {
            req.logger.info('Se ha creado el producto con éxito!');
        } catch (error) {
            req.logger.error("Error de código: " + error.message);
            console.error(error);
        }
    }

    let productCreate = new ProductDTO({ description, price, stock, category, availability, owner })  //aqui irá también image con la mejora del maquetado
    let userPremium = await userService.getRoleUser(owner)
    if(userPremium == 'premium'){
        let result = await productService.createProduct(productCreate)
    }else{
        req.logger.error("Error de autorización");
    }

})

export default router