import { Router } from "express";
import Products from "../dao/mongo/products.mongo.js"
import ProductDTO from "../dao/DTOs/products.dto.js";
import { productService } from "../repositories/pivot.js";

const router = Router()

const productMongo = new Products()

router.get("/", async (req, res) => {

    let result = await productMongo.get()
    res.send({ status: "success", payload: result })

})

router.post("/", async (req, res) => {
    let { description, price, stock, category, availability } = req.body  //aqui irá también image con la mejora del maquetado
    let productCreate = new ProductDTO({ description, price, stock, category, availability })  //aqui irá también image con la mejora del maquetado
    await productService.createProduct(productCreate)
})

export default router