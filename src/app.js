import express from 'express'
import mongoose from 'mongoose'
import config from './config/config.js'
import passport from "passport"
import cookieParser from "cookie-parser"
import UserMongo from "./dao/mongo/users.mongo.js"
import ProdMongo from "./dao/mongo/products.mongo.js"
import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import __dirname, { authorization, passportCall, transporter } from "./utils.js"
import initializePassport from "./config/passport.js"
import * as path from "path"
import {generateAndSetToken} from "./jwt/jwtoken.js"
import { generateProducts } from './utils.js'
import UserDTO from './dao/DTOs/users.dto.js'
import { engine } from "express-handlebars"
import crypto from 'crypto'
import {Server} from "socket.io"
//model password reset
import PasswordReset from './dao/mongo/models/passReset.model.js'
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
import loggerMiddleware from './middlewares/logger/loggerMiddleware.js'
import usersModel from './dao/mongo/models/users.model.js'


const app = express()
const port = 8080

const users = new UserMongo()
const products = new ProdMongo()

//conexión mongoose protegida por .env
mongoose.connect(config.mongo_url)
.then(()=>{
    console.log("Conectado a la BD")
})
.catch((error)=>{
    console.error(`Error al intentar conectar a la BD: ${error}`)
})

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
    
//gestión

    socket.on("newProd", (newProduct) => {
        products.addProduct(newProduct)
        socketServer.emit("success", "Producto Agregado Correctamente");
    });
    socket.on("updProd", ({id, newProduct}) => {
        products.updateProduct(id, newProduct)
        socketServer.emit("success", "Producto Actualizado Correctamente");
    });
    socket.on("delProd", (id) => {
        products.deleteProduct(id)
        socketServer.emit("success", "Producto Eliminado Correctamente");
    });

    socket.on("newEmail", async({email, comment}) => {
        let result = await transporter.sendMail({
            from:'Chat Nodemailer',
            to:email,
            subject:'Correo de Nodemailer',
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
    socket.emit("test","mensaje desde servidor a cliente, se valida en consola de navegador")
//-
})


//Endpoints Register, Login, Auth

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    // console.log(email)
    req.logger.info(email);
    // console.log(password)
    req.logger.info(password);
    const emailToFind = email;
    const user = await users.findEmail({ email: emailToFind });
    if (!user || user.password !== password) {
        req.logger.error("Error de autenticación");
        return res.status(401).json({ message: "Error de autenticación" });
    }
    const token = generateAndSetToken(res, email, password);
    const userDTO = new UserDTO(user);
    const prodAll = await products.get()
    res.json({ token, user: userDTO, prodAll});
  });

app.post("/api/register", async(req,res)=>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const {first_name, last_name, email,age, password, role} = req.body
    if(!first_name || typeof first_name !== 'string' || !last_name || typeof last_name !== 'string'|| !email || !emailRegex.test(email) ||!age ){
        req.logger.error("Error al crear el usuario");
        CustomError.createError({
            name:"Error en la creación de usuario",
            cause: generateUserErrorInfo({first_name, last_name, age, email}),
            message: "Error al intentar crear un nuevo usuario",
            code: EErrors.INVALID_TYPES_ERROR
        })
    }

    const emailToFind = email
    const ecorreo = await users.findEmail({ email: emailToFind })

    if(ecorreo) return res.status(400).send({status:"error", error: "Este correo ya fue registrado"})
    req.logger.info("Parámetros de usuario correctos");
    const newUser = {
        first_name,
        last_name,
        email,
        age,
        password,
        role
    };

    users.addUser(newUser)
    const token = generateAndSetToken(res, email, password) 
    res.send({token}) 

})

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: app.get('views') });
});

app.get('/register', (req, res) => {
    res.sendFile('register.html', { root: app.get('views') });
});

app.get('/current', passportCall('jwt', { session: false }), authorization('user'),(req,res) =>{
    authorization('user')(req, res,async() => {      
        const prodAll = await products.get();
        res.render('home', { products: prodAll });
    });
})

app.get('/admin',passportCall('jwt'), authorization('user'),(req,res) =>{
    authorization('user')(req, res,async() => {    
        const prodAll = await products.get();
        res.render('admin', { products: prodAll });
    });
})

//Restablecimiento de contraseña
app.post("/forgot-password", async (req,res)=>{
    const email = req.body.email;
    console.log(email)

    //verificar que el mail se encuentra en la base de datos
    const emailToFind = email;
    const user = await users.findEmail({ email: emailToFind });
    

    if (!user) {
        console.log("Email no se encuentra registrado");
        return res.status(401).json({ message: "Email no se encuentra registrado" });
    }
    //token único
    const token = crypto.randomBytes(20).toString('hex'); 
    //almacenar en mongoose
    await PasswordReset.create({ email, token });

    const resetLink = `http://localhost:8080/reset-password/${token}`;

    const mailOptions = {
    from: 'novositabisuteria@gmail.com',
    to: email,
    subject: 'Restablecer contraseña',
    text: `Estimada/o,\n\nPara restablecer su password, haga clic en el siguiente enlace: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ message: 'Error al enviar el correo electrónico' });
        }
        console.log('Email enviado ');
        res.send({ message: 'Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña.' });
    });

})

// formulario restablecimiento de contraseña
app.get('/restablecer', (req, res) => {
    res.sendFile('restablecer.html', { root: app.get('views') });
});

app.get('/reset-password/:token', async (req, res) => {
    // Obtener el token de la URL enviada al correo
    const  token  = req.params.token;
    console.log(token)

    try {
        // Existe el token en mongoose?
        const resetToken = await PasswordReset.findOne({ token }).exec();

        if (!resetToken) {
            // Token inválido después de la hora
            return res.redirect('/reset-password-expired');
        }

        // Renderizar la vista con el formulario de restablecimiento
        res.render('reset-password-form', { token });

    } catch (err) {
        return res.status(500).send('Error interno del servidor');
    }
});

// procesar restablecimiento contraseña
app.post('/reset-password/:token', async (req, res) => {
    const {token} = req.body
    console.log(token)
    // const token  = req.params.token;
    const { newPassword } = req.body;
    console.log(req.params)
    console.log(req.body)
    console.log(newPassword)
    // Verificar si el token existe en la base de datos
    const resetToken = await PasswordReset.findOne({ token });
  
    if (!resetToken) {
      return res.status(404).json({ message: 'El token cumplió su tiempo de expiración' });
    }

      // Actualizar la contraseña del usuario en la base de datos

    const updatedUser = await usersModel.findOneAndUpdate(
    { email: resetToken.email },
    { password: newPassword },
    { new: true }
    );  
    
    if (!updatedUser) {
        return res.status(500).json({ message: 'Error al actualizar la contraseña del usuario' });
    }
    //eliminar token de la BD
    await PasswordReset.deleteOne({ token: resetToken.token });
    //reenviar a la pantalla de exito
    // res.render('reset-password-success');
    // res.sendFile('reset-password-success.html', { root: app.get('views') });
    res.redirect('/reset-password-success');
});

app.get('/reset-password-success', (req, res) => {
    res.sendFile('reset-password-success.html', { root: app.get('views') });
    
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