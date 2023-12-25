import ticketsModel from './models/tickets.model.js'
import logger from '../../logger.js'

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
            logger.info("Ticket creado con éxito!")
            // console.log("Ticket creado con éxito!")
            return result

        } catch (error) {
            logger.error("No se pudo crear el ticket:", error);
            // console.error("No se pudo crear el ticket:", error);
            return "Error en creación de ticket";
        }
    }
}