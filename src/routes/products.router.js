import { Router } from "express";
import Products from "../dao/mongo/products.mongo.js"
import ProductDTO from "../dao/DTOs/products.dto.js";
import { productService, userService } from "../repositories/pivot.js";
import logger from "../logger.js";
import { transporter } from "../utils.js";
const router = Router()

const productMongo = new Products()

router.get("/", async (req, res) => {
    try{
        req.logger.info('Cargando productos');
        let result = await productMongo.get()
        res.status(200).send({ status: "success", payload: result });
        
    }catch(error){
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }

})

router.post("/", async (req, res) => {

    try{
        let { name, description, price, stock, category, availability, owner } = req.body  //aqui irá también image con la mejora del maquetado
        let productCreate = new ProductDTO({ name, description, price, stock, category, availability, owner })  //aqui irá también image con la mejora del maquetado
        let result = await productService.createProduct(productCreate)
        res.status(200).send({ status: "success", payload: result });
    }catch(error){
        res.status(500).send({ status: "error", message: "Error interno del servidor" });
    }  
})

router.put("/:productId", async (req,res)=>{
    try{
        const productId = req.params.productId
        const { name, description, price, stock, category, availability, owner } = req.body
        const productInfo = { name, description, price, stock, category, availability, owner }
        const result = await productService.updateProduct(productId,productInfo)

        res.status(200).send({ status: "success", payload: result });
    } catch(error){
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
})

// router.delete("/:productId", async (req,res) =>{
//     try{
//         const productId = req.params.productId
//         const {owner, productName} = req.body
//         const result = await productService.deleteProduct(productId)
//         const roleOwner = await userService.getRoleUser(owner)
//         if (roleOwner){
//             if(roleOwner == "premium" || roleOwner == "admin"){
//                 await transporter.sendMail({
//                     from:'Novosita <novositabisuteria@gmail.com>',
//                     to:owner,
//                     subject:'Correo desde Novositabisutería',
//                     html:`
//                     <div>
//                         <h1>Estimado usuario, informamos a usted que el producto ${productName} ha sido removido del catálogo</h1>
//                     </div>
//                     `,
//                     attachments:[]
//                 })
//             }
//         }
        
//         res.status(200).send({ status: "success", payload: result });
//     } catch {
//         console.error('Error al eliminar el producto:', error);
//         res.status(500).json({ error: "Error interno del servidor" });
//     }
// })

router.delete("/:productId", async (req, res) => {
    try {
        const productId = req.params.productId;
        const { owner, productName } = req.body;
        const result = await productService.deleteProduct(productId);

        try {
            const roleOwner = await userService.getRoleUser(owner);
            if (roleOwner && (roleOwner === "premium" || roleOwner === "admin")) {
                await transporter.sendMail({
                    from: 'Novosita <novositabisuteria@gmail.com>',
                    to: owner,
                    subject: 'Correo desde Novositabisutería',
                    html: `
                        <div>
                            <h1>Estimado usuario, informamos a usted que el producto ${productName} ha sido removido del catálogo</h1>
                        </div>
                    `,
                    attachments: []
                });
            }
        } catch (error) {
            console.error('Error al obtener el rol del propietario:', error);
        }

        res.status(200).send({ status: "success", payload: result });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router