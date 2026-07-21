const mongoose = require('mongoose');

const ongSchema = new mongoose.Schema({
  nome: {type: String, required: true,},
  email: {type: String, required: true, unique: true,},
  senha: {type: String, required: true,},
  cnpj: {type: String, required: true},
  cidade_regiao: {type: String, required: true},
  categoria: {type: [String], required: true},
  banner: {type: String, required: true},
  logo: {type: String, required: true},
  carrossel: {type: [String], required: true}
 }, { timestamps: true });

module.exports = mongoose.model('Ong', ongSchema);
