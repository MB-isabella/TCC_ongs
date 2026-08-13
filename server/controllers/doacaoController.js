const Ong = require('../models/ong');
const Usuario = require('../models/usuario');
const Doacao = require('../models/doacao');

const getInfoOng = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'ID da ONG é obrigatório' });
    }

    const ong = await Ong.findById(id).select('nome qrcode chavepix');

    if (!ong) {
      return res.status(404).json({ message: 'ONG não encontrada' });
    }

    return res.status(200).json({
      id: ong._id,
      nome: ong.nome,
      qrcode: ong.qrcode,
      chavepix: ong.chavepix
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar informações da ONG' });
  }
};

/* const getUsuarioVerficacao = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório' });
    }

    const usuario = await Usuario.findById(id).select('nome');

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.status(200).json({
      id: usuario._id,
      nome: usuario.nome
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar informações do usuário' });
  }
}; */

const gerarDoacao = async (req, res) => {
  try {
    const { usuarioId, ongId } = req.body;

    if (!usuarioId || !ongId) {
      return res.status(400).json({ message: 'Usuário e ONG são obrigatórios' });
    }

    const usuario = await Usuario.findById(usuarioId);
    const ong = await Ong.findById(ongId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (!ong) {
      return res.status(404).json({ message: 'ONG não encontrada' });
    }

    const novaDoacao = new Doacao({
      usuario: usuario._id,
      ong: ong._id
    });

    await novaDoacao.save();

    return res.status(201).json({
      message: 'Doação registrada com sucesso',
      doacao: novaDoacao
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao registrar doação' });
  }
};

module.exports = {
  getInfoOng,
  gerarDoacao
};

