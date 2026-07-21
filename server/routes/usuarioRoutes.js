const express = require('express');
const router = express.Router();
const { loginUsuario, registrarUsuario, editarUsuario, deletarUsuario } = require('../controllers/usuarioController');

router.post('/login-usuario', loginUsuario);
router.post('/registrar-usuario', registrarUsuario);
router.put('/editar-usuario/:id', editarUsuario);
router.delete('/deletar-usuario/:id', deletarUsuario);

module.exports = router;