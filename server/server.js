// backend/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./mongo');
const { uploadToCloudinary } = require('./routes/cloudinary');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const ongRoutes = require('./routes/ongRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const doacaoRoutes = require('./routes/doacaoRoutes');
const { PORT } = require('./config');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/agendamentos', appointmentRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/ong', ongRoutes);
app.use('/catalogo', catalogoRoutes);
app.use('/doacao', doacaoRoutes);
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Arquivo de imagem é obrigatório.' });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    return res.status(200).json({
      mensagem: 'Imagem enviada com sucesso.',
      url: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message || 'Erro ao enviar imagem para o Cloudinary.' });
  }
});
app.get('/', (req, res) => {
  res.json({ mensagem: 'Servidor rodando corretamente' });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta http://localhost:${PORT}`));
