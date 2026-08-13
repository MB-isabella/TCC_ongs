const express = require('express');
const router = express.Router();
const {getInfoOng, gerarDoacao } = require('../controllers/doacaoController');

router.get('/:id', getInfoOng);
router.post('/registro-doacao/:id', gerarDoacao);


module.exports = router;