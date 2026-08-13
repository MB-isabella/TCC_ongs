const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { loginOng, registrarOng, editarOng, deletarOng } = require('../controllers/ongController');

const middlewareCampos = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'carrossel', maxCount: 5 } // Permite até 5 imagens no carrossel
]);

router.post('/login-ong', loginOng);
router.post('/registrar-ong', registrarOng, middlewareImagensOng);
router.put('/editar-ong/:id', editarOng, middlewareImagensOng);
router.delete('/deletar-ong/:id', deletarOng);

module.exports = router;