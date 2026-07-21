const Ong = require('../models/ong');

const getOngs = async (req, res) => {
  try {
    const ongs = await Ong.find().select('nome categoria banner logo').sort({ createdAt: -1 });

    res.json(
      ongs.map((ong) => ({
        id: ong._id,
        nome: ong.nome,
        categoria: ong.categoria,
        banner: ong.banner,
        logo: ong.logo
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar ONGs' });
  }
};



module.exports = { getOngs };