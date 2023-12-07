import mongoose from "mongoose"

const ticketsCollection = "ticket";

const ticketSchema = new mongoose.Schema({
    code: String,
    amount: Number,
    purchaser: String,
    purchase_datetime: Date
})

const ticketsModel = mongoose.model(ticketsCollection, ticketSchema)

export default ticketsModel