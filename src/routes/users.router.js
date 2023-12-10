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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    let { first_name, last_name, email, age, password, role } = req.body
    
    if(!first_name || typeof first_name !== 'string' || !last_name || typeof last_name !== 'string'|| !email || !emailRegex.test(email) ||!age || !Number.isInteger(age)){
        CustomError.createError({
            name:"Error en la creación de usuario",
            cause: generateUserErrorInfo({first_name, last_name, age, email}),
            message: "Error al intentar crear un nuevo usuario",
            code: EErrors.INVALID_TYPES_ERROR
        })
    }

    let userCreate = new UserDTO({ first_name, last_name, email, age, password, role })

    let result = await userService.createUser(userCreate)
    console.log(result)
    
})

export default router