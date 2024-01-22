import passport from "passport"
import bcrypt from 'bcrypt'
import path from "path"
import { fileURLToPath } from "url"
import nodemailer from 'nodemailer'
import config from "./config/config.js"
import { faker } from "@faker-js/faker"
import multer from "multer"
import fs from 'fs'

export const createHash = async password => {
    const sRounds = 10
    return await bcrypt.hash(password, sRounds)
}

export const isValidPassword = (user,password) => bcrypt.compareSync(password, user.password)

export const passportCall = (strategy) => {
    
    return async(req, res, next)=>{
        passport.authenticate(strategy, function(err, user, info){
            if(err) return next(err)
            if(!user){
                return res.status(401).send({error:info.messages?info.messages:info.toString()})
            }
            req.user = user
            next()
        })(req, res, next)
    }

}

export const authorization= (role) => {
    return async(req, res, next)=>{
        if(!req.user) return res.status(401).send({error: "Unauthorized"})
        if(req.user.role!= role) return res.status(403).send({error:"No permissions"})
        next()
    }
}

export const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth:{
        user: config.admin_mail,
        pass: config.admin_mail_pass
    }
})

export const generateProducts=()=>{
    const stock = parseInt(faker.commerce.price({ min: 0, max: 20 })) //no habia random de stock, pero puede adaptarse método .price
    const availability = stock === 0 ? "no_stock_available" : "available_stock";

    return{
        description: faker.commerce.productDescription(),
        price: faker.commerce.price({ min: 3000, max: 18000 }),
        stock: stock,
        category: faker.commerce.department(), //For a department in a shop or product category, use department()
        availability: availability 
        // title: faker.commerce.productName(),
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const fileType = file.fieldname;
      let uploadPath = 'public/files/';
  
      // Determina la carpeta de destino según el tipo de archivo
      switch (fileType) {
        case 'profiles':
          uploadPath += 'profiles/';
          break;
        case 'products':
          uploadPath += 'products/';
          break;
        case 'documents':
          uploadPath += 'documents/';
          break;
        case 'identification': //identificacion
          uploadPath += 'documents/';
          break;
       case 'proof_of_address': //comprobante domicilio
          uploadPath += 'documents/';
          break;
       case 'statement_of_accounts': // comprobante cuenta
          uploadPath += 'documents/';
          break;
        default:
          uploadPath += 'other/';
          break;
      }
  
      // Generar carpeta si no existe aún
      const fullPath = path.join(__dirname, uploadPath);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
  
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const fileType = file.fieldname;
  
      // Nombres únicos de archivos con Date y random
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      const finalFilePath = fileType + '-' + uniqueSuffix + fileExtension;
  
      cb(null, finalFilePath);
    }
  });

  export const addFile = multer({ storage: storage });


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default __dirname