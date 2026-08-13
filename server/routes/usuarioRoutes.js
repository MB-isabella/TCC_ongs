const express = require('express');
const multer = require('multer');
const router = express.Router();
const { loginUsuario, registrarUsuario, editarUsuario, deletarUsuario, getPerfilUsuario } = require('../controllers/usuarioController');

router.post('/login-usuario', loginUsuario);
router.post('/registrar-usuario', upload.single('imagem'), registrarUsuario);
router.put('/editar-usuario/:id', upload.single('imagem'), editarUsuario);
router.get('/perfil-usuario/:id', getPerfilUsuario);
router.delete('/deletar-usuario/:id', deletarUsuario);

module.exports = router;