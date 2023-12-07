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
import UserDTO from './dao/DTOs/users.dto.js'
import { engine } from "express-handlebars"
import {Server} from "socket.io"
import cartsRouter from './routes/carts.router.js'
import productsRouter from './routes/products.router.js'
import usersRouter from './routes/users.router.js'
import ticketsRouter from './routes/tickets.router.js'

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



const serverIo = app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})


//Endpoints commerce
app.use("/api/carts", cartsRouter)
app.use("/api/products", productsRouter)
app.use("/api/users", usersRouter)
app.use("/api/tickets", ticketsRouter)




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
    console.log(email)
    console.log(password)
    const emailToFind = email;
    const user = await users.findEmail({ email: emailToFind });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Error de autenticación" });
    }
    const token = generateAndSetToken(res, email, password);
    const userDTO = new UserDTO(user);
    const prodAll = await products.get()
    res.json({ token, user: userDTO, prodAll});
  });

app.post("/api/register", async(req,res)=>{

    const {first_name, last_name, email,age, password, role} = req.body
    const emailToFind = email
    const ecorreo = await users.findEmail({ email: emailToFind })

    if(ecorreo) return res.status(400).send({status:"error", error: "Este correo ya fue registrado"})
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