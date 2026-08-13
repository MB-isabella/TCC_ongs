const Ong = require('../models/ong');
const { uploadToCloudinary } = require('../utils/cloudinary');

// função para carregar as informações que serão utilizadas nos cards de ong no catálogo
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

// função para carregar as informações que serão utilizadas na tela de perfil da ong
const getPerfilOngs = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'ID da ONG é obrigatório' });
    }

    const ong = await Ong.findById(id).select('nome email cnpj cidade_regiao categoria banner logo carrossel');

    if (!ong) {
      return res.status(404).json({ message: 'ONG não encontrada' });
    }

    res.json({
      id: ong._id,
      nome: ong.nome,
      email: ong.email,
      cnpj: ong.cnpj,
      cidade_regiao: ong.cidade_regiao,
      categoria: ong.categoria,
      banner: ong.banner,
      logo: ong.logo,
      carrossel: ong.carrossel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar ONG' });
  }
};

// função para carregar as informações que serão filtradas na barra de pesquisa
const BarradePesquisa = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      const allOngs = await Ong.find().select('nome categoria banner logo').lean();
      return res.status(200).json(allOngs.map((ong) => ({
        id: ong._id,
        nome: ong.nome,
        categoria: ong.categoria,
        banner: ong.banner,
        logo: ong.logo
      })));
    }

    const sanitizedSearch = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(sanitizedSearch, 'i');

    const ongs = await Ong.find({
      $or: [
        { nome: searchRegex },
        { categoria: searchRegex }
      ]
    })
      .select('nome categoria banner logo')
      .lean();

    return res.status(200).json(ongs.map((ong) => ({
      id: ong._id,
      nome: ong.nome,
      categoria: ong.categoria,
      banner: ong.banner,
      logo: ong.logo
    })));
  } catch (error) {
    console.error('Erro ao buscar ONGs:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar busca' });
  }
};



module.exports = { getOngs, getPerfilOngs, BarradePesquisa };