import mongoose from "mongoose"

const productsCollection = "products";

const productsSchema = new mongoose.Schema({
    description: { type: String, max: 300},
    price: { type: Number},
    stock: { type: Number},
    category: { type: String, max: 50 }, 
    availability: { type: String, enum: ['available_stock', 'no_stock_available'] } 
    // image: { type: String, max: 300}, ****** a agregar con la mejora del maquetado
})

const productsModel = mongoose.model(productsCollection, productsSchema)

export default productsModel;