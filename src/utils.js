import path from "path"
import { fileURLToPath } from "url"
import passport from "passport"
import nodemailer from 'nodemailer'
import config from "./config/config.js"
import { faker } from "@faker-js/faker"

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
    return{
        description: faker.commerce.productDescription(),
        price: faker.commerce.price({ min: 3000, max: 18000 }),
        stock: faker.commerce.price({ min: 1, max: 20 }), //no habia random de stock, pero puede adaptarse método .price
        category: faker.commerce.department(), //For a department in a shop or product category, use department()
        availability: "available_stock"
        // title: faker.commerce.productName(),
    }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default __dirname