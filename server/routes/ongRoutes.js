const express = require('express');
const router = express.Router();
const { loginOng, registrarOng, editarOng, deletarOng } = require('../controllers/ongController');

router.post('/login-ong', loginOng);
router.post('/registrar-ong', registrarOng);
router.put('/editar-ong/:id', editarOng);
router.delete('/deletar-ong/:id', deletarOng);

module.exports = router;