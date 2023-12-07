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
    
            return { cart }

        } catch (error) {
            console.error("No se logró obtener el carrito:", error);
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
            console.error("No se logró obtener el stock:", error);
            return { error: "Error al obtener el stock" };
        }
    };

    getAmount = async ({ productos }) => {
        try {
            let totalAmount = 0;
    
            if (!productos || !Array.isArray(productos)) {
                console.error('productos no es una lista válida');
                return totalAmount;
            }
    
            for (const producto of productos) {
                totalAmount += producto.price * producto.stock;
            }
    
            return totalAmount;

        } catch (error) {
            console.error("No se logró calcular el valor total:", error);
            return
        }
    };
    
    addCart = async (cart) => {

        let result = await cartsModel.create(cart)
        console.log("Carrito creado con éxito!")
        return result
    }
}