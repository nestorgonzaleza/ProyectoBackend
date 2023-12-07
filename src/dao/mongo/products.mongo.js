import productsModel from './models/products.model.js'
import mongoose from 'mongoose'

export default class Products {
    constructor() {

    }

    get = async () => {
        let products = await productsModel.find()
        return products
    }

    addProduct = async (productInfo) => {
        try
        {
            let result = await productsModel.create(productInfo);
            console.log("Producto creado con éxito")
            return result

        }catch(error){
            console.error('No se logró crear el producto:', error);
            return 'No se logró crear el producto';
        }      
    }

    updateProduct = async (productId, productInfo) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return 'No existe ID válido para el producto';
            }
            let result = await productsModel.updateOne({ _id: new mongoose.Types.ObjectId(productId) }, { $set: productInfo });
            console.log("Producto actualizado ", result)

        } catch (error) {
            console.error('Error al actualizar producto:', error);
            return 'Error al actualizar producto';
        }
    }

    deleteProduct = async (productId) => {
        try {

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return 'No existe ID válido para el producto';
            }
    
            let deletedProduct = await productsModel.deleteOne({ _id: new mongoose.Types.ObjectId(productId) });
    
            if (deletedProduct.deletedCount > 0) {
                   return 'Producto eliminado';
            } else {
                return 'No existe ID válido para el producto';
            }
        } catch (error) {
            console.error('No se logró eliminar el producto:', error);
            return 'No se logró eliminar el producto';
        }
    };
}