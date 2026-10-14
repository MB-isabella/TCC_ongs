const express = require('express');
const router = express.Router();
const { getOngs, getPerfilOngs, BarradePesquisa } = require('../controllers/catalogoController');

router.get('/', getOngs);
router.get('/pesquisa', BarradePesquisa);
router.get('/perfil-ong/:id', getPerfilOngs);


module.exports = router;