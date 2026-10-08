const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error(`Arquivo inválido (${file.fieldname}): envie um arquivo de imagem.`));
      return;
    }
    callback(null, true);
  },
});
const { loginOng, registrarOng, editarOng, deletarOng, getPerfilOngsProprietario } = require('../controllers/ongController');

const middlewareImagensOng = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'qrcode', maxCount: 1 },
  { name: 'carrossel', maxCount: 5 } // Permite até 5 imagens no carrossel
]);

const validarUploadsOng = (req, res, next) => {
  middlewareImagensOng(req, res, (erro) => {
    if (!erro) return next();

    if (erro instanceof multer.MulterError) {
      const campo = erro.field ? ` (${erro.field})` : '';
      const mensagensErroUpload = {
        LIMIT_PART_COUNT: 'A solicitação contém partes demais. Envie os dados novamente.',
        LIMIT_FILE_SIZE: 'Arquivo muito grande: reduza o tamanho da imagem e tente novamente.',
        LIMIT_FILE_COUNT: 'Quantidade de arquivos excedida: confira os limites de imagens e tente novamente.',
        LIMIT_FIELD_KEY: 'Nome de campo inválido: atualize a página e tente novamente.',
        LIMIT_FIELD_VALUE: 'Um dos campos contém informação longa demais.',
        LIMIT_FIELD_COUNT: 'Quantidade de campos excedida: confira os dados e tente novamente.',
        LIMIT_UNEXPECTED_FILE: 'Arquivo não aceito: confira o campo de envio e os limites de imagens.',
      };
      const mensagem = erro.code === 'LIMIT_UNEXPECTED_FILE' && erro.field === 'carrossel'
        ? 'Limite de arquivos excedido (Carrossel): selecione no máximo 5 imagens.'
        : `${mensagensErroUpload[erro.code] || 'Falha ao processar os arquivos enviados.'}${campo}.`;
      return res.status(400).json({ mensagem });
    }

    return res.status(400).json({ mensagem: erro.message || 'Arquivo inválido: confira as imagens selecionadas.' });
  });
};

router.post('/login-ong', loginOng);
router.post('/registrar-ong', validarUploadsOng, registrarOng);
router.get('/minha-ong/:id', getPerfilOngsProprietario);
router.put('/editar-ong/:id', middlewareImagensOng, editarOng);
router.delete('/deletar-ong/:id', deletarOng);

module.exports = router;