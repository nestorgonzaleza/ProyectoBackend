import logger from '../../logger.js'
import cartsModel from './models/carts.model.js'
import productsModel from './models/products.model.js'

export default class Carts {
    constructor() {

    }

    get = async () => {
        let carts = await cartsModel.find()
        return carts
    }



    getCart = async (id_cart) => {
        try {
            const cart = await cartsModel.findById(id_cart);
    
            if (!cart) {
                return { error: "No se encontró el ID para el carrito" };
            }
    
            return cart 

        } catch (error) {
            logger.error("No se logró obtener el carrito:", error);
            // console.error("No se logró obtener el carrito:", error);
            return "No se logró obtener el carrito" 
        }
    }

    getStock = async ({ productos }) => {
        try {
            const stockInf = {};
            const errors = [];
    
            for (const producto of productos) {

                const productInCollection = await productsModel.findOne({ description: producto.description });
    
                if (!productInCollection) {
                    errors.push({ description: producto.description, error: 'No existe el producto mencionado en la Database' });
                    stockInf[producto.description] = { status: 'No se encontró el producto' };
                    continue;
                }
    
                if (productInCollection.stock >= producto.stock) {

                    await productsModel.updateOne({ description: productInCollection.description },{ $inc: { stock: -producto.stock } });
    
                    stockInf[producto.description] = {
                        status: 'Suficiente',
                        availableQuantity: productInCollection.stock - producto.stock,
                        requiredQuantity: producto.stock,
                    };

                } else {
                    errors.push({ description: producto.description, error: 'No hay stock suficiente' });
                    stockInf[producto.description] = { status: 'No hay stock suficiente' };
                }
            }
    
            if (errors.length > 0) {
                return { errors, stockInf };
            }  
            return stockInf;

        } catch (error) {
            logger.error("No se logró obtener el stock:", error);
            // console.error("No se logró obtener el stock:", error);
            return { error: "Error al obtener el stock" };
        }
    };

    getAmount = async ({ productos }) => {
        try {
            let totalAmount = 0;
    
            if (!productos || !Array.isArray(productos)) {
                logger.error('productos no es una lista válida');
                // console.error('productos no es una lista válida');
                return totalAmount;
            }
    
            for (const producto of productos) {
                totalAmount += producto.price * producto.stock;
            }
    
            return totalAmount;

        } catch (error) {
            logger.error("No se logró calcular el valor total:", error);
            // console.error("No se logró calcular el valor total:", error);
            return
        }
    };
    
    addCart = async (newCart) => {

        // let result = await cartsModel.create(cart)
        logger.warn("Se añade un nuevo carrito...")
        let result = await cartsModel.create(newCart)
        logger.info("Carrito creado con éxito!")

        // console.log("Carrito creado con éxito!")
        return result
    }

    addProduct = async (cartId, productId)=>{
        try{
        const carrito = await cartsModel.findOne({_id: cartId})
        if(carrito){
            const productoExistente = carrito.products.find(producto=> String(producto.productId) === String(productId))

            if(productoExistente){
                productoExistente.quantity += 1
            }else{
                carrito.products.push({productId, quantity: 1})
            }
            await carrito.save()
            return carrito
        }else{
            console.error("No se encontró ID asociado al carrito")
        }
        } catch(error){
            console.error('Error al agregar producto al carrito:', error);
            throw error;

        }
    }
}