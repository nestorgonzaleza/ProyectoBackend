import { Router } from "express";
import Tickets from "../dao/mongo/tickets.mongo.js"
import TicketDTO from "../dao/DTOs/tickets.dto.js";
import { ticketService } from "../repositories/pivot.js";
import logger from "../logger.js";
const router = Router()

const ticketMongo = new Tickets()

router.get("/", async (req, res) => {
    req.logger.info('Emitiendo tickets');
    let result = await ticketMongo.get()
    res.send({ status: "success", payload: result })

})

router.post("/", async (req, res) => {

    let { amount, purchaser } = req.body
    let ticketCreate = new TicketDTO({ amount, purchaser })
    let result = await ticketService.createTicket(ticketCreate)
    if(result){
        req.logger.info('Se ha creado el ticket');
        console.log('Se ha creado el ticket')
    }else{
        req.logger.error("Error creando el ticket");
        console.log("Error creando el ticket")
    }
})

export default router