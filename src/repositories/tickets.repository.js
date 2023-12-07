import TicketDTO from "../dao/DTOs/tickets.dto.js";

export default class TicketRepository {
    constructor(dao) {
        this.dao = dao
    }

    getTickets = async () => {
        let result = await this.dao.get()
        return result
    }

    createTicket = async (ticket) => {
        let ticketToCreate = new TicketDTO(ticket)
        let result = await this.dao.addTicket(ticketToCreate)
        return result
    }
}