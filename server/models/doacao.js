const mongoose = require('mongoose');

const doacaoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  ong: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ong',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Doacao', doacaoSchema);