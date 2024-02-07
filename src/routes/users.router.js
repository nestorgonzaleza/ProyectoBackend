import { Router } from "express";
import Users from "../dao/mongo/users.mongo.js"
import UserDTO from "../dao/DTOs/users.dto.js";
import { userService } from "../repositories/pivot.js";
import { addFile } from "../utils.js";
import { transporter } from "../utils.js";
import { passportCall, authorization } from "../utils.js";
const router = Router()

const usersMongo = new Users()

router.get("/",passportCall('jwt'), authorization('user'), async (req, res) => {
  authorization('user')(req, res,async() => {
    try{
      const user = req.user
      req.logger.info('Cargando usuarios...');
      let result = await userService.getUsers()
      const members = result.map(user=>({
        first_name: user.first_name,
        email: user.email,
        role: user.role
      }));
      // console.log(users)
      // res.status(200).send({ status: "success", payload: result })
      res.render('admin.users.handlebars', { user, members });
      // res.json({ users })
    
    } catch (error) {
      res.status(500).send({status:"error", message:"Internal Error"})
    }
  });
})

router.post("/", async (req, res) => {

    try
    {
        let { first_name, last_name, email, age, password, role } = req.body
        let userCreate = new UserDTO({ first_name, last_name, email, age, password, role })
        let createdUser = await userService.createUser(userCreate)

        if(createdUser){
          req.logger.info("Se ha creado el usuario exitosamente")
        }else{
          req.logger.error("No fue posible crear usuario")
        }
        res.status(200).send({ status: "success", payload: result });
    }
    catch (error)
    {
        res.status(500).send({ status: "error", message: "Internal Error" });
    }

})

router.post("/premium/:uid", async (req, res) => {
    try {
      // const { role } = req.body;

      const uid = req.params.uid;
      const userToUp = await usersMongo.getUserById(uid)
      const role = userToUp.role

      const roleType = ["usuario","admin","premium"]

      if(!roleType.includes(role)){
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Verify documents
      if(!(await usersMongo.verifyDocuments(uid))){
        return res.status(400).json({ error: 'Usuario no cumple con documentos requeridos para avanzar a premium' });
      }

      //actualizar Rol
      let upgradeRole = await userService.updUserRole({uid, role});
   
      if (upgradeRole) {
        req.logger.info('Rol actualizado con éxito');
        res.status(200).json({ message: 'Rol actualizado con éxito' });
      } else {
        req.logger.error('No fue posible actualizar rol');
        res.status(500).json({ error: 'No fue posible actualizar rol' });
      }
    } catch (error) {
      console.error('Error en la ruta /premium/:uid :', error);
      res.status(500).json({ error: 'Error interno' });
    }
  });

router.delete("/", async (req,res)=>{
  const actualDate = new Date()
  let usersToCheckDate = await userService.getUsers()

  const inactiveUsers = usersToCheckDate.filter(user=>((actualDate - user.last_connection)/(1000*60*60*24))>2);
  // const inactiveUsers = usersToCheckDate.filter(user=>((actualDate - user.last_connection)/(1000*60))>5);
  inactiveUsers.map(async (inactive)=> {
    await transporter.sendMail({
    from:'Novosita <novositabisuteria@gmail.com>',
    to: inactive.email,
    subject:'Correo desde Novositabisutería',
    html:`
    <div>
        <h1>Estimado usuario, informarmos a usted que su cuenta ${inactive.email} ha sido removida por inactividad superior a 2 días</h1>
    </div>
    `,

  }),

  await userService.deleteUser(inactive._id)
  })
  res.json(inactiveUsers)
})

router.delete("/5min", async (req,res)=>{
  const actualDate = new Date()
  let usersToCheckDate = await userService.getUsers()

  // const inactiveUsers = usersToCheckDate.filter(user=>((actualDate - user.last_connection)/(1000*60*60*24))>2);
  const inactiveUsers = usersToCheckDate.filter(user=>((actualDate - user.last_connection)/(1000*60))>2);
  inactiveUsers.map(async (inactive)=> {
    await transporter.sendMail({
    from:'Novosita <novositabisuteria@gmail.com>',
    to: inactive.email,
    subject:'Correo desde Novositabisutería',
    html:`
    <div>
        <h1>Estimado usuario, informarmos a usted que su cuenta ${inactive.email} ha sido removida por inactividad superior a 5 minutos</h1>
    </div>
    `,

  }),
  console.log("se ha eliminado el usuario " + inactive)
  await userService.deleteUser(inactive._id)
  })
  res.json(inactiveUsers)
})

  
  const uFiles = []
  router.post("/:uid/documents", addFile.fields([
    { name: 'profiles', maxCount: 2 },    
    { name: 'products', maxCount: 2 },
    { name: 'documents', maxCount: 2 },
    { name: 'identification', maxCount: 1 },
    { name: 'proof_of_address', maxCount: 1 },
    { name: 'statement_of_accounts', maxCount: 1 }
  ]), async(req,res) =>{

    const files = req.files
    const userId = req.params.uid
    let userFound = await usersMongo.getUserById(userId)

    if(!userFound) {
      return res.status(404).json({ status: 'error', error: 'No fue posible encontrar el usuario' });
    }

    //verificar y procesar archivos según fields
    if (files['profiles']) {
      const profiles = files['profiles'].map(file => ({ name: 'profiles', path: file.path }));
      
      usersMongo.manageNewDocuments(userId, ...profiles)
      uFiles.push(...profiles);
    }
  
    if (files['products']) {
      const productFiles = files['products'].map(file => ({ name: 'products', path: file.path }));
     
      usersMongo.manageNewDocuments(userId, ...productFiles)
      uFiles.push(...productFiles);
    }
  
    if (files['documents']) {
      const documentFiles = files['documents'].map(file => ({ name: 'documents', reference: file.path }));

      usersMongo.manageNewDocuments(userId, ...documentFiles)
      uFiles.push(...documentFiles);
    }

    // identificacion
    if (files['identification']) {
      const identificationFiles = files['identification'].map(file => ({ name: 'identification', reference: file.path }));

      usersMongo.manageNewDocuments(userId, ...identificationFiles)
      uFiles.push(...identificationFiles);
    }

    if (files['proof_of_address']) {
      const proof_of_addressFiles = files['proof_of_address'].map(file => ({ name: 'proof_of_address', reference: file.path }));

      usersMongo.manageNewDocuments(userId, ...proof_of_addressFiles)
      uFiles.push(...proof_of_addressFiles);
    }

    if (files['statement_of_accounts']) {
      const statement_of_accountsFiles = files['statement_of_accounts'].map(file => ({ name: 'statement_of_accounts', reference: file.path }));

      usersMongo.manageNewDocuments(userId, ...statement_of_accountsFiles)
      uFiles.push(...statement_of_accountsFiles);
    }

    res.send({ status: "success", message: "Archivo subido con éxito" });
  }
  )

export default router