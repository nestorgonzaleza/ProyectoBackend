import express from "express";
import mongoose from "mongoose";

const app = express()
const port = 8080

const connection = mongoose.connect("mongodb+srv://nestorgonzalez:012342023@clusterbackend.m8mx5zs.mongodb.net/?retryWrites=true&w=majority")

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})