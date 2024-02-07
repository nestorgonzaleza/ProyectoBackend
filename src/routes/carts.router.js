import { Router } from "express";
import CartDTO from "../dao/DTOs/carts.dto.js";
import Carts from "../dao/mongo/carts.mongo.js";
import Users from "../dao/mongo/users.mongo.js";
import Products from "../dao/mongo/products.mongo.js";
import { ticketService, cartService, userService } from "../repositories/pivot.js";
import TicketDTO from "../dao/DTOs/tickets.dto.js";
import logger from "../logger.js";
const router = Router()

const cartMongo = new Carts()
const usersMongo = new Users()
const productMongo = new Products() 

router.get("/", async (req, res) => {
    try{
        let result = await cartMongo.get()
        res.status(200).send({ status: "success", payload: result });

    }catch(error){
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }


})

router.get("/mycart/:userMail/:cartId", async (req, res) => {
    try {
        // const { cartId, userMail } = req.body;
        const cartId = req.params.cartId
        const userMail = req.params.userMail 
        
        req.logger.info('Cargando carrito...');
        
        // Obtener usuario y carrito
        const user = await usersMongo.getUserByEmail(userMail);
        const usermail = user.email;
        const carritoUsuario = await cartMongo.getCart(cartId);
        const productsInCart = carritoUsuario.products;

        // Obtener catálogo de productos
        const catalogo = await productMongo.get();

        // Modificar los productos del carrito con información del catálogo
        const products = productsInCart.map(productInCart => {
            // Buscar el producto en el catálogo por su productId
            const productInfo = catalogo.find(product => product._id.equals(productInCart.productId));
            // Calcular el costo total del producto
            const totalPrice = productInfo.price * productInCart.quantity;
            // Crear un nuevo objeto con la información necesaria
            return {
                _id: productInfo._id,
                name: productInfo.name,
                price: productInfo.price,
                quantity: productInCart.quantity,
                totalPrice: totalPrice
            };
        });

        // Calcular la sumatoria de los precios totales de los productos en el carrito
        const totalSum = products.reduce((acc, curr) => acc + curr.totalPrice, 0);


        // Renderizar el Handlebars con la información del usuario y los productos en el carrito
        res.render('home.cart.handlebars', { usermail, products, totalSum });
      
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "error", message: "Internal Error" });
    }
});

router.post("/", async (req, res) => {
    try{
        let { products } = req.body
        let cart = new CartDTO({ products })
        let result = await cartService.createCart(cart)
        res.status(200).send({ status: "success", payload: result });
    }catch(error){
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }
    
})

router.post("/:cid/buy", async (req, res) => {

    // body para apidocs:
    // 1)INGRESAR EN apidocs a  /api/carts
    // 2) y luego repetir el mismo body en/api/carts/{cid}/buy
    // reemplazando {cid} con el id del carrito creado al usar /api/carts
    
    // {
    //     "productos": [
    //       {
    //         "name": "prod 1",
    //         "description": "Prod 1",
    //         "price": 100,
    //         "stock": 5,
    //         "category": "categoria 1",
    //         "availability": "available_stock"
    //       },
    //       {
    //         "name": "prod 2",
    //         "description": "Prod 2",
    //         "price": 100,
    //         "stock": 5,
    //         "category": "categoria 1",
    //         "availability": "available_stock"
    //       }
    //     ],
    //     "correo": "test@coder.com"
    // }

    try {

        let id_cart = req.params.cid;
        const productos = req.body.productos;
        const correo = req.body.correo;

        let cart = cartService.validateCart(id_cart)

        if (!cart) {
            // req.logger.error("No se encontró el ID para el carrito");
            // return { error: "No se encontró el ID para el carrito" };
            res.status(401).send({ status: "error", message: "No se encontró el ID para el carrito" });
        }
        let validateStock = cartService.validateStock({productos})

        if (validateStock) {

            let totalAmount = await cartService.getAmount({productos})
            const ticketBase = new TicketDTO({amount:totalAmount, purchaser:correo});
            const result = await ticketService.createTicket(ticketBase);
            res.status(200).send({ status: "success", payload: result });

        } else {
            console.log("No hay stock");
            res.status(300).send({ status: "error", message: "No hay stock disponible" });
        }
        
    } catch (error) {
        req.logger.error("Error al procesar el ticket:" + error.message);
        console.error("Error al procesar el ticket:", error);
        return res.status(500).json({ error: "Error interno al procesar" });
    }
    
})

export default router