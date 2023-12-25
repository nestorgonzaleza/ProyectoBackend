import usersModel from './models/users.model.js'
import logger from '../../logger.js'

export default class Users {
    constructor() {

    }

    get = async () => {
        try{

            let users = await usersModel.find()
            return users

        }catch (error){
            logger.error("No fue posible acceder a la lista de usuarios: ", error)
            // console.error('No fue posible acceder a la lista de usuarios:', error);
            return 'No fue posible acceder a la lista de usuarios';

        }       
    }

    findEmail = async (findData) => {
        try{
            const user = await usersModel.findOne(findData)  
            return user
        }catch (error) {
            // logger.error('No se encontró el email:', error)
            console.error('No se encontró el email:', error);
            return 'Error encontrando email';
        }   
        
    }

    addUser = async (userData) => {
        try{
            let userCreate = await usersModel.create(userData);
            logger.info("Usuario creado con éxito");
            // console.log("Usuario creado con éxito")
            return userCreate
        }catch(error){
            logger.error('No fue posible crear el usuario:', error)
            // console.error('No fue posible crear el usuario:', error);
            return 'No fue posible crear el usuario';
        }      
    }

   


    findJWT = async (fJWT) => {
        try
        {
            const user = await usersModel.find(fJWT)
            return user
        }catch(error){
            logger.error('Error con JWT:', error);
            // console.error('Error con JWT:', error);
            return 'Error con el JWT';
        }      
    }
}