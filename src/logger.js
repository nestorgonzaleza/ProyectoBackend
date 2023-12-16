import winston, { format } from "winston"

const devlogger = winston.createLogger({
    level: "debug",
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ 
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),    
            filename: "devErrors.log",
            level: "error"
        })
    ]
})

const prodlogger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ 
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),    
            filename: "prodErrors.log",
            level: "error"
        })
    ]
})

const logger = (process.env.winstonENV === "production" ? prodlogger : devlogger)

export default logger;