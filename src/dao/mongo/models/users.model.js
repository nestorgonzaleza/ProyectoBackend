import mongoose from "mongoose"

const usersCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    age: Number,
    password: String,
    role: String,
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
      },
    documents: [
        {
            name:{type: String},
            reference:{type: String}
        }
    ],
    last_connection: Date
})

const usersModel = mongoose.model(usersCollection, userSchema)

export default usersModel