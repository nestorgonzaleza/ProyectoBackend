import express from 'express'
import mongoose from 'mongoose'
import config from './config/config.js'
import passport from "passport"
import cookieParser from "cookie-parser"
import UserMongo from "./dao/mongo/users.mongo.js"
import ProdMongo from "./dao/mongo/products.mongo.js"
import CartsMongo from "./dao/mongo/carts.mongo.js"
import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import __dirname, { authorization, passportCall, transporter, createHash, isValidPassword } from "./utils.js"
import initializePassport from "./config/passport.js"
import * as path from "path"
import {generateAndSetToken, generateAndSetTokenEmail, getEmailToken, getEmailTokenLogin, valTokenResetPass} from "./jwt/jwtoken.js"
import { generateProducts } from './utils.js'
import UserDTO from './dao/DTOs/users.dto.js'
import { engine } from "express-handlebars"
import crypto from 'crypto'
import {Server} from "socket.io"
import cartsModel from './dao/mongo/models/carts.model.js'
//apidoc
import swaggerJSDoc from 'swagger-jsdoc';
import SwaggerUiExpress from "swagger-ui-express"
//importación rutas
import cartsRouter from './routes/carts.router.js'
import productsRouter from './routes/products.router.js'
import usersRouter from './routes/users.router.js'
import ticketsRouter from './routes/tickets.router.js'
//importacion errors
import CustomError from './services/errors/CustomError.js'
import EErrors from './services/errors/enums.js'
import { generateUserErrorInfo } from './services/errors/info.js'
//logger
import loggerMiddleware from './loggerMiddleware.js'
import usersModel from './dao/mongo/models/users.model.js'


const app = express()
const port = 8080

const users = new UserMongo()
const products = new ProdMongo()
const carts = new CartsMongo()

//conexión mongoose protegida por .env
mongoose.connect(config.mongo_url)
.then(()=>{
    console.log("Conectado a la BD")
})
.catch((error)=>{
    console.error(`Error al intentar conectar a la BD: ${error}`)
})

//apidocs swagger
const swaggerOptions = {
    definition:{
        openapi: "3.0.1",
        info: {
            title: "Documentación de Api",
            description: "Documentación de rutas para ecommerce"
        },
    },
    apis:["src/docs/products.yaml",
        "src/docs/carts.yaml"]
}

const specs = swaggerJSDoc(swaggerOptions)
app.use("/apidocs", SwaggerUiExpress.serve, SwaggerUiExpress.setup(specs))


//passport middleware y jwt

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "Secret-key"
}

passport.use(
    
    new JwtStrategy(jwtOptions, (jwt_payload, done)=>{
        const user = users.findJWT((user) =>user.email === jwt_payload.email)
        if(!user)
        {
            return done(null, false, {message:"No se encontró el usuario"})
        }
        return done(null, user)
    })

)

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')));
app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", path.resolve(__dirname + "/views"))
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());
app.use(loggerMiddleware)


const serverIo = app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})


//Endpoints commerce
app.use("/api/carts", cartsRouter)
app.use("/api/products", productsRouter)
app.use("/api/users", usersRouter)
app.use("/api/tickets", ticketsRouter)

//Endpoint Mocking de productos
app.get("/mockingproducts",(req,res)=>{
    let productsMocking = []
    for (let i = 0; i < 100; i++){
        productsMocking.push(generateProducts())
    }
    req.logger.warn("Productos generados, recuerde ingresarlos usando POSTMAN o Thunder");
    res.send({status: "succes", payload: productsMocking})
})


//websocket

const socketServer = new Server(serverIo)

//Conexión
socketServer.on("connection", socket => {
    console.log("Socket Conectado")


//Se recibe info del front
    socket.on("message", data => {
        console.log(data)
    })
    
//gestión productos
    //recargar productos
    socket.on("reloadProducts",()=>{
        socketServer.emit("success", "Nuevo producto agregado con éxito");
    })

    socket.on("newProd", async (newProduct) => {

        let validUserPremium = await users.getUserRoleByEmail(newProduct.owner)
        console.log(validUserPremium)
        if(validUserPremium == 'premium'||validUserPremium == 'admin'){
            products.addProduct(newProduct)
            socketServer.emit("success", "Nuevo producto agregado con éxito");
        }else{
            socketServer.emit("errorUserPremium", "Usuario no posee credenciales para crear");
        }
        
    });
    socket.on("updProd", ({id, newProduct}) => {
        products.updateProduct(id, newProduct)
        socketServer.emit("success", "Actualizacion de producto realizada");
    });
    socket.on("delProd", (id) => {
        products.deleteProduct(id)
        socketServer.emit("success", "Se eliminó el producto");
    });
    //producto añadido
    socket.on("addedProduct",()=>{
        socket.emit("success", "Prodcuto añadido exitosamente")
    })
    //producto eliminado
    socket.on("deletedProduct", ()=>{
        socket.emit("success", "Producto eliminado exitosamente")
    })
    //producto editado
    socket.on("editedProduct", ()=>{
        socket.emit("success", "Producto editado exitosamente")
    })
    // Encontrar el producto seleccionado en la lista de productos
    socket.on("dataProd", async (id) =>{
     
        const productData = await products.getProductById(id)
 
        socketServer.emit("foundProd", productData)
    });

    socket.on("delProdPremium", ({id, owner, email}) => {

        if(owner == email){
            products.deleteProduct(id)
            socketServer.emit("success", "Producto Eliminado Correctamente");
        }else{
            socketServer.emit("errorDelPremium", "No cuenta con autorización para eliminar");
        }  
    });

//gestión usuarios

    // Encontrar el rol del usuario seleccionado en la lista de usuarios
    socket.on("dataUser", async (email) =>{

        const userData = await users.getUserByEmail(email)

        socketServer.emit("foundUser", userData)
    });

    //actualizar el rol del usuario
    socket.on("updUser", ({mailUser, newRole}) => {

        users.updateUserRoleByEmail(mailUser, newRole)
        socketServer.emit("success", "Actualizacion de rol realizada");
    });

    //eliminar usuario con boton
    socket.on("delUser", (emailUser) => {
        users.deleteUserByEmail(emailUser)
        socketServer.emit("success", "Se eliminó el usuario");
    });
    //recargar usuarios
    socket.on("reloadUsers", async ()=>{
        socketServer.emit("success", "Usuarios inactivos eliminados");
    })

//******************gestion compra */   
    socket.on("addToChart", async ({ email, productId, owner }) => {
        // const productOwner = products.getOwner(productId)
        if(owner===email){
            socket.emit("autoCompra", "No puedes comprar productos que son de tu propiedad")

        }else{
            try {    
                const user = await users.getUserByEmail(email)
                if (user && user.cart) {
                    const cartId = user.cart._id;
                    await carts.addProduct(cartId, productId);
                    socket.emit("success", "Producto añadido al carrito con éxito!");
                } else {
                    console.error("Usuario o carrito no encontrados");
                }
            
            }catch(error){
                console.error("Error al agregar producto al carrito:", error);
            }
        }
    })

// ver carrito
    socket.on("carrousuario", async (email) =>{
        const user = await users.getUserByEmail(email)
        const userMail = email
        if (user && user.cart) {
            const cartId = user.cart._id;


            socket.emit("solicitudCarro", {cartId,userMail});
        } else {
            console.error("Usuario o carrito no encontrados");
        }
    });    

//password
    socket.on("notMatchPass", () => {
        socketServer.emit("warning", "Las contraseñas deben ser iguales");
    });
    socket.on("validActualPass", async({newPassword, newPasswordVerif, email}) => {
        const emailToFind = email;
        const user = await users.findEmail({ email: emailToFind });
        const passActual = users.getPasswordByEmail(emailToFind)
        const validSamePass = isValidPassword(user, newPassword)

        if(validSamePass){
            socketServer.emit("samePass","No se puede ingresar la última contraseña valida, reintente");
        }else{
            const hashedPassword = await createHash(newPassword);
            const updatePassword = await users.updatePassword(email,hashedPassword)
            if(updatePassword)
            {
                socketServer.emit("passChange","La contraseña fue cambiada correctamente");    
            }
            else
            {
                socketServer.emit("errorPassChange","Error al cambiar la contraseña");   
            }
        }        
    });

    socket.on("newEmail", async({email, comment}) => {
        let result = await transporter.sendMail({
            from:'Novosita <novositabisuteria@gmail.com>',
            to:email,
            subject:'Correo desde Novositabisutería',
            html:`
            <div>
                <h1>${comment}</h1>
            </div>
            `,
            attachments:[]
        })
        socketServer.emit("success", "Correo enviado correctamente");
    });
//Enviar datos al front
    socket.emit("test","mensaje desde back a front")
//-
})


//Endpoints Register, Login, Auth

app.post("/login", async (req, res) => {

    const { email, password } = req.body;
    const emailToFind = email;
    const user = await users.findEmail({ email: emailToFind });

    if (!user) {
      req.logger.error("Error de autenticación: Usuario no encontrado");
      return res.status(401).json({ message: "Error de autenticación" });
    }

    // validar pass
    try {
        const passwordMatch = isValidPassword(user, password);

        if (!passwordMatch) {
            req.logger.error("Error: Contraseña inválida");
            return res.status(401).json({ message: "Error de autenticación" });
        }

        // pass ok...
        const token = generateAndSetToken(res, email, password);  
        // const userDTO = new UserDTO(user);
        const prodAll = await products.get();
        // console.log(prodAll)
        users.setLastConnection(email)
     
        // res.json({ token, user: userDTO, prodAll });
        res.json({ token, user, prodAll });
       
        req.logger.info("Inicio de sesión exitoso para el usuario: " + emailToFind);
   

    } catch (error) {

        req.logger.error("Error al comparar contraseñas: " + error.message);
        console.error("Error al comparar contraseñas:", error);
        return res.status(500).json({ message: "Error interno del servidor" });

    }
});

app.post("/api/register", async (req, res) => {
    const { first_name, last_name, email, age, password, role } = req.body;
    const emailToFind = email;
    const emailFound = await users.findEmail({ email: emailToFind });

    if (emailFound) {
        req.logger.warn("Este correo ya se encuentra en uso: " + emailToFind);
        return res.send({ status: "error", error: "El usuario ya está en uso" });
    }

    const hashedPassword = await createHash(password);
    const newCart ={
        products:[]
    } 
    const createdCart = await carts.addCart(newCart)
   
    const newUser = {
        first_name,
        last_name,
        email,
        age,
        password: hashedPassword,
        role,
        cart: createdCart._id
    };

    try {

        users.addUser(newUser);
        const token = generateAndSetToken(res, email, password);
        res.send({ token });

        req.logger.info("Se ha registrado exitosamente el siguiente usuario: " + emailToFind);

    } catch (error) {

        req.logger.error("Error al registrarse: " + error.message);
        console.error("Error al registrarse:", error);
        res.status(500).json({ message: "Error interno del servidor" });

    }
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: app.get('views') });
});

app.get('/register', (req, res) => {
    res.sendFile('register.html', { root: app.get('views') });
});

app.get('/current', passportCall('jwt', { session: false }), authorization('user'),(req,res) =>{
    authorization('user')(req, res,async() => {
        const email = req.user.email
        const user = await users.getUserByEmail(email)
        const userJSON = user.toJSON()
         
        const prodAll = await products.get();
        res.render('home', { products: prodAll, user: userJSON });
        // res.render('home', { products: prodAll, user: userInfo });
    });
})

app.get('/current-super',passportCall('jwt', { session: false }), authorization('user'),(req,res) =>{
    authorization('user')(req, res, async() => {  
        const {token} = req.query;
 
        const emailToken = getEmailTokenLogin(token) 

        const prodAll = await products.get();
        
        res.render('home-super', { products: prodAll, email: emailToken });
    });
})

app.get('/admin',passportCall('jwt'), authorization('user'),(req,res) =>{
    authorization('user')(req, res,async() => {
        const user = req.user    
        const prodAll = await products.get();

        res.render('admin', { products: prodAll, user });
    });
})



app.get('/logout', (req, res) => {
    req.logger.info("Se Cierra Sesión");
    let email = req.query.email
    users.setLastConnection(email)
    res.redirect('/');
});

//Restablecimiento de contraseña

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const emailToFind = email;
    const userFound = await users.findEmail({ email: emailToFind });
    if (!userFound) {

      console.error("No se pudo restablecer la contraseña, "+email+" no existe")
      res.json("No se pudo restablecer la contraseña, "+email+" no existe" );
      return res.status(401).json({ message: "Error al reestablecer contraseña" });
    }
    // token 1 h
    const token = generateAndSetTokenEmail(email)
  
    // link para password
    const resetLink = `http://localhost:8080/reset-password?token=${token}`;
  
    let result = transporter.sendMail({
        from:'<novositabisuteria@gmail.com>',
        to:email,
        subject:'Restablecimiento de password',
        html:`Ingrese al enlace para continuar con el restablecimiento de contraseña: <a href="${resetLink}">Restablecer contraseña</a>`,
        attachments:[]
    })
    if(result)
    {
        res.json("Se envió enlace de restablecimiento de password a "+email);
    }
    else
    {
        console.error("No se pudo restablecer contraseña");
        res.json("No se pudo restablecer contraseña");
    }
  });

app.get('/reset-password', async (req, res) => {
    const {token} = req.query;
    const validate = valTokenResetPass(token)
    const emailToken = getEmailToken(token)
    if(validate){
        res.render('reset-password-form', { token , email: emailToken});
    }
    else{
        res.sendFile('index.html', { root: app.get('views') });
    }
});


//Test de Logger

app.get("/loggerTest", (req,res)=>{
    req.logger.error("Mensaje de error");
    req.logger.warn("Mensaje de warn");
    req.logger.info("Mensaje de info");
    req.logger.http("Mensaje de http");
    req.logger.verbose("Mensaje de verbose");
    req.logger.debug("Mensaje de debug");
    req.logger.silly("Mensaje de silly");
    res.send("Logs realizados")
})

