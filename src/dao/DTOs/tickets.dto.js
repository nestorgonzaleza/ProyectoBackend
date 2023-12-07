import {nanoid} from "nanoid" //crea random ID

export default class TicketDTO {
    constructor(ticket) {
        this.code = nanoid()
        this.amount = ticket.amount
        this.purchaser = ticket.purchaser
        this.purchase_datetime = new Date()
    }
}