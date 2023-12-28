import TicketDTO from "../dao/DTOs/tickets.dto.js";

export default class TicketRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTicket = async (ticket) => {
        let ticketToCreate = new TicketDTO(ticket)
        let result = await this.dao.addTicket(ticketToCreate)
        return result
    }
    getTickets = async () => {
        let result = await this.dao.get()
        return result
    }

}