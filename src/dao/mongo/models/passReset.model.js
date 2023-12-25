import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, expires: 3600, default: Date.now }, // 3600 para 1 hora
});

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

export default PasswordReset;