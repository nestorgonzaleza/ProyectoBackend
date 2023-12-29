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
          // Buscar el usuario por correo electrónico en tu modelo de usuario
          const user = await usersModel.findOne({ email });
      
          // Verificar si se encontró un usuario y si tiene un rol premium
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

    updatePassword = async (email, newPassword) => {
        try {
            const updatedUser = await usersModel.findOneAndUpdate(
                { email: email },
                { $set: { password: newPassword } },
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
            { $set: { role: role } },
            { new: true }
          );
      
          if (updatedUser) {
            return updatedUser;
          } else {
            console.error('Usuario no encontrado');
            return null; // o lanza una excepción según tus necesidades
          }
        } catch (error) {
          console.error('Error al actualizar el rol:', error);
          return 'Error al actualizar el rol';
        }
      };
}