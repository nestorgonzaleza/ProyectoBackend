import { Router } from "express";
import CartDTO from "../dao/DTOs/carts.dto.js";
import Carts from "../dao/mongo/carts.mongo.js";
import { ticketService, cartService, userService } from "../repositories/pivot.js";
import TicketDTO from "../dao/DTOs/tickets.dto.js";
import logger from "../logger.js";
const router = Router()

const cartMongo = new Carts()

router.get("/", async (req, res) => {
    try{
        let result = await cartMongo.get()
        res.status(200).send({ status: "success", payload: result });

    }catch(error){
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }


})

router.post("/", async (req, res) => {
    try{
        let { products } = req.body
        let cart = new CartDTO({ products })
        let result = await cartService.createCart(cart)
        res.status(200).send({ status: "success", payload: result });
    }catch(error){
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }
    
})

router.post("/:cid/buy", async (req, res) => {

    // body para apidocs:
    // 1)INGRESAR EN apidocs a  /api/carts
    // 2) y luego repetir el mismo body en/api/carts/{cid}/buy
    // reemplazando {cid} con el id del carrito creado al usar /api/carts
    
    // {
    //     "productos": [
    //       {
    //         "name": "prod 1",
    //         "description": "Prod 1",
    //         "price": 100,
    //         "stock": 5,
    //         "category": "categoria 1",
    //         "availability": "available_stock"
    //       },
    //       {
    //         "name": "prod 2",
    //         "description": "Prod 2",
    //         "price": 100,
    //         "stock": 5,
    //         "category": "categoria 1",
    //         "availability": "available_stock"
    //       }
    //     ],
    //     "correo": "test@coder.com"
    // }

    try {

        let id_cart = req.params.cid;
        const productos = req.body.productos;
        const correo = req.body.correo;

        let cart = cartService.validateCart(id_cart)

        if (!cart) {
            // req.logger.error("No se encontró el ID para el carrito");
            // return { error: "No se encontró el ID para el carrito" };
            res.status(401).send({ status: "error", message: "No se encontró el ID para el carrito" });
        }
        let validateStock = cartService.validateStock({productos})

        if (validateStock) {

            let totalAmount = await cartService.getAmount({productos})
            const ticketBase = new TicketDTO({amount:totalAmount, purchaser:correo});
            const result = await ticketService.createTicket(ticketBase);
            res.status(200).send({ status: "success", payload: result });

        } else {
            console.log("No hay stock");
            res.status(300).send({ status: "error", message: "No hay stock disponible" });
        }
        
    } catch (error) {
        req.logger.error("Error al procesar el ticket:" + error.message);
        console.error("Error al procesar el ticket:", error);
        return res.status(500).json({ error: "Error interno al procesar" });
    }
    
})

export default router