const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const { JWT_SECRET } = require('../config');

// Realizar login
const loginUsuario = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).json({ mensagem: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    const token = jwt.sign(
      { userId: usuario._id, tipo: usuario.tipo },
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
const registrarUsuario = async (req, res) => {
  const { nome, login, email, senha, imagem_perfil } = req.body;

  try {
    const usuarioExistente = await Usuario.findOne({ email });

    if (usuarioExistente) {
      return res.status(400).json({ mensagem: 'Usuário já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = new Usuario({
      nome,
      login,
      email,
      senha: senhaHash,
      imagem_perfil,
    });

    await novoUsuario.save();

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// Realiza a edição ou update
// o hash está certo ??

const editarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, login, email, senha, imagem_perfil } = req.body;

  try {
    const usuarioEditar = await Usuario.findById(id);
    const usuarioIgual = email ? await Usuario.findOne({ email, _id: { $ne: id } }): null;

    if (!usuarioEditar) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    if (usuarioIgual) {
      return res.status(400).json({ mensagem: 'Usuário com mesmo email já cadastrado' });
    }

    let senhaHashEditada;
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      senhaHashEditada = await bcrypt.hash(senha, salt);
    }

    if (nome) usuarioEditar.nome = nome;
    if (login) usuarioEditar.login = login;
    if (email) usuarioEditar.email = email;
    if (senha) usuarioEditar.senha = senhaHashEditada;
    if (imagem_perfil) usuarioEditar.imagem_perfil = imagem_perfil;

    await usuarioEditar.save();

    res.json({ mensagem: 'Usuário atualizado com sucesso', usuario: usuarioEditar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar usuário' });
  }
};

const deletarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuarioDeletar = await Usuario.findOneAndDelete({ _id: id});

    if (!usuarioDeletar) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.json({ mensagem: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao deletar Usuário' });
  }
};


module.exports = {
  loginUsuario,
  registrarUsuario,
  editarUsuario,
  deletarUsuario,
};