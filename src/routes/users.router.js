import { Router } from "express";
import Users from "../dao/mongo/users.mongo.js"
import UserDTO from "../dao/DTOs/users.dto.js";
import { userService } from "../repositories/pivot.js";
import logger from "../logger.js";
const router = Router()

const usersMongo = new Users()

router.get("/", async (req, res) => {
    req.logger.info('Cargando usuarios...');
    let result = await usersMongo.get()
    res.send({ status: "success", payload: result })

})

router.post("/", async (req, res) => {
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // let { first_name, last_name, email, age, password, role } = req.body
    
    // if(!first_name || typeof first_name !== 'string' || !last_name || typeof last_name !== 'string'|| !email || !emailRegex.test(email) ||!age || !Number.isInteger(age)){
    //     CustomError.createError({
    //         name:"Error en la creación de usuario",
    //         cause: generateUserErrorInfo({first_name, last_name, age, email}),
    //         message: "Error al intentar crear un nuevo usuario",
    //         code: EErrors.INVALID_TYPES_ERROR
    //     })
    // }

    // let userCreate = new UserDTO({ first_name, last_name, email, age, password, role })

    // let result = await userService.createUser(userCreate)
    // if(result){
    //     req.logger.info('Usuario creado con éxito');
    // }else{
    //     req.logger.error("Error al crear Usuario");
    // } 
    // console.log(result)
    try
    {
        let { first_name, last_name, email, age, password, role } = req.body
        let user = new UserDTO({ first_name, last_name, email, age, password, role })
        let result = await userService.createUser(user)
        res.status(200).send({ status: "success", payload: result });
    }
    catch (error)
    {
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }

})

router.post("/premium/:uid", async (req, res) => {
    try {
      const { role } = req.body;
      const uid = req.params.uid;

      let changeRole = await userService.updUserRole({uid, role});
  
      if (changeRole) {
        req.logger.info('Rol actualizado con éxito');
        res.status(200).json({ message: 'Rol actualizado con éxito' });
      } else {
        req.logger.error('No fue posible actualizar rol');
        res.status(500).json({ error: 'No fue posible actualizar rol' });
      }
    } catch (error) {
      console.error('Error en la ruta /premium/:uid:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  });

export default router