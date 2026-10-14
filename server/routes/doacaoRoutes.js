const express = require('express');
const router = express.Router();
const {getInfoOng, gerarDoacao } = require('../controllers/doacaoController');
const authMiddleware = require('../middleware/authMiddleware');

const exigirUsuario = (req, res, next) => {
  if (req.userTipo !== 'usuario') {
    return res.status(403).json({ mensagem: 'Apenas usuários podem acessar esta funcionalidade' });
  }

  return next();
};

router.get('/:id', authMiddleware, exigirUsuario, getInfoOng);
router.post('/registro-doacao/:id', authMiddleware, exigirUsuario, gerarDoacao);


module.exports = router;