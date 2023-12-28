import { Router } from "express";
import CartDTO from "../dao/DTOs/carts.dto.js";
import Carts from "../dao/mongo/carts.mongo.js";
import { ticketService, cartService, userService } from "../repositories/pivot.js";
import TicketDTO from "../dao/DTOs/tickets.dto.js";
import logger from "../logger.js";
const router = Router()

const cartMongo = new Carts()

router.get("/", async (req, res) => {

    let result = await cartMongo.get()
    res.send({ status: "success", payload: result })

})

router.post("/", async (req, res) => {

    let { products } = req.body
    const correo = req.body.correo;
    let roleUser = userService.getRoleUser(products.owner)

    if(roleUser == 'premium' && correo == products.owner)
    {
        console.log("No se puede agregar al carrito un producto que ya pertenece al usuario")
    }else{
        let cart = new CartDTO({ products })
        let result = await cartService.createCart(cart)
    }

    if(result){
        req.logger.info('Se ha creado un carrito con éxito!');
    }else{
        req.logger.error("No fue posible crear el carrito");
    }

})

router.post("/:cid/buy", async (req, res) => {
    try {

        let id_cart = req.params.cid;
        const productos = req.body.productos;
        const correo = req.body.correo;

        let cart = cartService.validateCart(id_cart)

        if (!cart) {
            req.logger.error("No se encontró el ID para el carrito");
            return { error: "No se encontró el ID para el carrito" };
        }
        let validateStock = cartService.validateStock({productos})

        if (validateStock) {

            let totalAmount = await cartService.getAmount({productos})
            const ticketBase = new TicketDTO({amount:totalAmount, purchaser:correo});
            const result = await ticketService.createTicket(ticketBase);

        } else {
            console.log("No hay stock");
        }
        
    } catch (error) {
        req.logger.error("Error al procesar el ticket:" + error.message);
        console.error("Error al procesar el ticket:", error);
        return res.status(500).json({ error: "Error interno al procesar" });
    }
    
})

export default router