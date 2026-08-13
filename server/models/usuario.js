const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nome: {type: String, required: true,},
  login: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true,},
  senha: {type: String, required: true,},
  imagem_perfil: {type: String, required: false} 
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
