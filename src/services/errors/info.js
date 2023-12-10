export const generateUserErrorInfo = (user) =>{
    return `Uno o varios de los campos no son válidos.
    Favor verificar:
    *Nombre: Debe ser un String o cadena de caracteres, se ingresó "${user.first_name}"
    *Apellido: Debe ser un String o cadena de caracteres, se ingresó "${user.last_name}"
    *email: Debe ser un String o cadena de caracteres en formato mail (ejemplo: usuario@dominio.com), se ingresó "${user.email}"
    *Edad: Debe ser un número, se ingresó ${user.age}`
    
}