import { Router } from "express";
import Users from "../dao/mongo/users.mongo.js"
import UserDTO from "../dao/DTOs/users.dto.js";
import { userService } from "../repositories/pivot.js";

const router = Router()

const usersMongo = new Users()

router.get("/", async (req, res) => {

    let result = await usersMongo.get()
    res.send({ status: "success", payload: result })

})

router.post("/", async (req, res) => {

    let { first_name, last_name, email, age, password, role } = req.body

    let userCreate = new UserDTO({ first_name, last_name, email, age, password, role })

    let result = await userService.createUser(userCreate)
    console.log(result)
    
})

export default router