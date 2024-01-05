import { Router } from "express";
import Products from "../dao/mongo/products.mongo.js"
import ProductDTO from "../dao/DTOs/products.dto.js";
import { productService, userService } from "../repositories/pivot.js";
import logger from "../logger.js";
const router = Router()

const productMongo = new Products()

router.get("/", async (req, res) => {
    try{
        req.logger.info('Cargando productos');
        let result = await productMongo.get()
        res.status(200).send({ status: "success", payload: result });
        
    }catch(error){
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }

})

router.post("/", async (req, res) => {
    try{
        let { name, description, price, stock, category, availability, owner } = req.body  //aqui irá también image con la mejora del maquetado
        let productCreate = new ProductDTO({ name, description, price, stock, category, availability, owner })  //aqui irá también image con la mejora del maquetado
        let result = await productService.createProduct(productCreate)
        res.status(200).send({ status: "success", payload: result });
    }catch(error){
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }  
})

export default router