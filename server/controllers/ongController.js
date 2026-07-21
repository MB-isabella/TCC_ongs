const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Ong = require('../models/ong');
const { JWT_SECRET } = require('../config');

// Realizar login
const loginOng = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const ong = await Ong.findOne({ email });

    if (!ong) {
      return res.status(400).json({ mensagem: 'Ong não encontrada' });
    }

    const senhaValida = await bcrypt.compare(senha, ong.senha);

    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    const token = jwt.sign(
      { userId: ong._id },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ mensagem: 'Login bem-sucedido', token });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

//Realizar registro
const registrarOng = async (req, res) => {
  const { nome, login, email, senha, cnpj, cidade_regiao, categoria, logo, banner, carrossel } = req.body;

  try {
    const ongExistente = await Ong.findOne({ email });

    if (ongExistente) {
      return res.status(400).json({ mensagem: 'Ong já cadastrada' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novaOng = new Ong({
      nome,
      login,
      email,
      senha: senhaHash,
      cnpj,
      cidade_regiao,
      categoria,
      logo,
      banner,
      carrossel
    });

    await novaOng.save();

    res.status(201).json({ mensagem: 'Ong cadastrada com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

const editarOng = async (req, res) => {
  const { id } = req.params;
  const { nome, login, email, senha, cnpj, cidade_regiao, categoria, logo, banner, carrossel } = req.body;

  try {
    const ongEditar = await Ong.findById(id);

    if (!ongEditar) {
      return res.status(404).json({ mensagem: 'Ong não encontrada' });
    }

    let senhaHashEditada;
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      senhaHashEditada = await bcrypt.hash(senha, salt);
    }

    if (nome) ongEditar.nome = nome;
    if (login) ongEditar.login = login;
    if (email) ongEditar.email = email;
    if (senha) ongEditar.senha = senhaHashEditada;
    if (cnpj) ongEditar.cnpj = cnpj;
    if (cidade_regiao) ongEditar.cidade_regiao = cidade_regiao;
    if (categoria) ongEditar.categoria = categoria;
    if (logo) ongEditar.logo = logo;
    if (banner) ongEditar.banner = banner;
    if (carrossel) ongEditar.carrossel = carrossel;

    await ongEditar.save();

    res.json({ mensagem: 'Ong atualizada com sucesso', ong: ongEditar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar Ong' });
  }
};

const deletarOng = async (req, res) => {
  const { id } = req.params;

  try {
    const ongDeletar = await Ong.findOneAndDelete({ _id: id});

    if (!ongDeletar) {
      return res.status(404).json({ mensagem: 'Ong não encontrada' });
    }

    res.json({ mensagem: 'Ong deletada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao deletar Ong' });
  }
};


module.exports = {
  loginOng,
  registrarOng,
  editarOng,
  deletarOng,
};