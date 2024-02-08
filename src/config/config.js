import dotenv from 'dotenv'

dotenv.config()
export default {
    mongo_url: process.env.mongo_url,
    persistence: process.env.PERSISTENCE,
    admin_mail: process.env.admin_mail,
    admin_mail_pass: process.env.admin_mail_pass,
    winstonENV: process.env.winstonENV
}