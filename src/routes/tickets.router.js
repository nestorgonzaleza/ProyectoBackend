import { Router } from "express";
import Tickets from "../dao/mongo/tickets.mongo.js"
import TicketDTO from "../dao/DTOs/tickets.dto.js";
import { ticketService } from "../repositories/pivot.js";

const router = Router()

const ticketMongo = new Tickets()

router.get("/", async (req, res) => {

    let result = await ticketMongo.get()
    res.send({ status: "success", payload: result })

})

router.post("/", async (req, res) => {

    let { amount, purchaser } = req.body
    let ticketCreate = new TicketDTO({ amount, purchaser })
    await ticketService.createTicket(ticketCreate)

})

export default router