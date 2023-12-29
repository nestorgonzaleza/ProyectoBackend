import jwt from 'jsonwebtoken';
//jwt
export function generateAndSetToken(res, email, password) {
  const token = jwt.sign({ email, password, role: "user" }, "Secret-key", { expiresIn: "24h" });
  res.cookie("token", token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
  return token
}
//*** */
export function generateAndSetTokenEmail(email) {
  const token = jwt.sign({ email }, 'secreto', { expiresIn: '1h' });
  return token
}

export function getEmailTokenLogin(token) {
  try {
    // console.log("el token que llego a la funcion getEmailTokenLogin es "+token)
    const decoded = jwt.verify(token, 'Secret-key');
    return decoded.email;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null; 
  }
}

export function getEmailToken(token) {
  try {
    const decoded = jwt.verify(token, 'secreto');
    const email = decoded.email;
    return email;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}

export function valTokenResetPass(token) {
  try {
    const result = jwt.verify(token, 'secreto');
    return result;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('El token ha expirado');
      return null; 
    } else {
      console.error('Error al verificar el token:', error);
      return null; 
    }
  }
}