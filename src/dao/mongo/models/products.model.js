import mongoose from "mongoose"

const productsCollection = "products";

const productsSchema = new mongoose.Schema({
    name: { type: String, max:30 },
    description: { type: String, max: 300},
    price: { type: Number},
    stock: { type: Number},
    category: { type: String, max: 50 }, 
    availability: { type: String, enum: ['available_stock', 'no_stock_available'] },
    owner: { type: String, max: 50}
    // image: { type: String, max: 300}, ****** a agregar con la mejora del maquetado
})

const productsModel = mongoose.model(productsCollection, productsSchema)

export default productsModel;