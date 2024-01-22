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

    getUserById = async (id) => { 
        try 
        {
          const user = await usersModel.findById(id).lean();    
          if (!user) 
          {
            return 'No fue posible encontrar el usuario';
          }   
          return user;
        } catch (error) {
            // logger.error('No se encontró el id de usuario:', error)
          console.error('No se encontró el usuario:', error);
          return 'Error al obtener el usuario';
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

    getUserRoleByEmail = async (email) => {
        try {
          
          const user = await usersModel.findOne({ email });
                
          if (user && user.role === 'premium') {
            return 'premium'
          } else {
            return "usuario con otro rol"
          }
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
          return 'Error al obtener el rol del usuario';
        }
    };

    updatePassword = async (email, newPass) => {
        try {
            const updatedUser = await usersModel.findOneAndUpdate(
                { email: email },
                { $set: { password: newPass } },
                { new: true } 
            );
    
            if (updatedUser) {
                return updatedUser;
            } else {
                console.error('Usuario no encontrado');
            }
        } catch (error) {
            console.error('Error al actualizar la contraseña:', error);
            return 'Error al actualizar la contraseña';
        }
    };

    getPasswordByEmail = async (email) => {
        try {
          const user = await usersModel.findOne({ email: email }).lean();
      
          if (user) {
            const pass = user.password;
            return pass; 
          } else {
            return null; 
          }
        } catch (error) {
          console.error('Error al obtener el usuario:', error);
          return 'Error al obtener el usuario';
        }
    };
    
    updateUserRoleById = async ({uid, role}) => {
        try {
          const updatedUser = await usersModel.findByIdAndUpdate(
            uid,
            // { $set: { role: role } },
            { $set: { role: 'premium' } },
            { new: true }
          );
          console.log("Este es el que pasa por updateuserrolebyid:", updatedUser)  
          if (updatedUser) {
            return updatedUser;
          } else {
            console.error('No se encontró el usuario');
            return null; 
          }
        } catch (error) {
          console.error('No se pudo actualizar el rol:', error);
          return 'Error al actualizar rol';
        }
      };

    manageNewDocuments = async (userId, newDocuments) => {
      try{
        //buscar usuario
        const user = await usersModel.findById(userId)

        if (!user) {
          console.error("No se encontró el ID del usuario")
          return null
        }
        //verificar que la clave de documents sea arreglo
        if (!Array.isArray(user.documents)) {
          user.documents = []
        }

        //pushear los documentos a documents
        user.documents.push(...(Array.isArray(newDocuments) ? newDocuments : [newDocuments]))

        const updatedDocumentsUser = await user.save()
        return updatedDocumentsUser

      } catch (error) {

        console.error("Error al gestionar documentos: ", error)
        throw error
      }
    }  

    verifyDocuments = async (userId) =>{
      try{

        const user = await usersModel.findById(userId)
        //si no se encuentra el usuario o no hay elementos en el array documents
        if(!user || !Array.isArray(user.documents)){
          return false
        }

        const requiredDocuments = [
          'identification',
          'proof_of_address',
          'statement_of_accounts'
        ]

        //verificar que los documentos están...
        for (const requiredDocument of requiredDocuments) {
          const documentOK = user.documents.some(document => document.name === requiredDocument);
          if (!documentOK) {
            return false; 
          }
        }
        // si están los 3 tipos de documentos...
        return true

      } catch(error) {
        console.error('No fue posible verificar los documentos:', error);
        throw error;
      }
    }


    //guardar última conexión
    setLastConnection = async (email) => {
      try{
        const updatedConnectionUser = await usersModel.findOneAndUpdate(
          { email: email}, { $set: { last_connection: new Date() } }, { new: true}
        )

        if (updatedConnectionUser) {
          return updatedConnectionUser
        } else {
          console.error("No fue posible actualizar última conexión")
          return null
        }

      } catch (error) {
        console.error("Falló actualizar última conexión: ", error)
        throw error
      }
    }


}