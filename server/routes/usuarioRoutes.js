const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const {
  loginUsuario,
  registrarUsuario,
  editarUsuario,
  deletarUsuario,
  getPerfilUsuario,
  solicitarRecuperacaoSenha,
  redefinirSenha,
} = require('../controllers/usuarioController');

router.post('/login-usuario', loginUsuario);
router.post('/registrar-usuario', upload.single('imagem'), registrarUsuario);
router.post('/solicitar-recuperacao-senha', solicitarRecuperacaoSenha);
router.post('/redefinir-senha', redefinirSenha);
router.put('/editar-usuario/:id', upload.single('imagem'), editarUsuario);
router.get('/perfil-usuario/:id', getPerfilUsuario);
router.delete('/deletar-usuario/:id', deletarUsuario);

module.exports = router;