import ticketsModel from './models/tickets.model.js'

export default class Tickets {
    constructor() {

    }

    get = async () => {
        let tickets = await ticketsModel.find()
        return tickets
    }
    addTicket = async (ticket) => {
        try {
            let result = await ticketsModel.create(ticket);
            console.log("Ticket creado con éxito!")
            return result

        } catch (error) {
            console.error("No se pudo crear el ticket:", error);
            return "Error en creación de ticket";
        }
    }
}