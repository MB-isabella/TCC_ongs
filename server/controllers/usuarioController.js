const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { uploadToCloudinary } = require('../routes/cloudinary');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const Ong = require('../models/ong');
const Doacao = require('../models/doacao');
const { JWT_SECRET } = require('../config');

const solicitarRecuperacaoSenha = async (req, res) => {
  const { email, tipo = 'usuario' } = req.body;
  const Modelo = tipo === 'ong' ? Ong : tipo === 'usuario' ? Usuario : null;

  if (!Modelo || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('EMAIL_USER e EMAIL_PASS precisam estar configurados para enviar e-mails.');
    return res.status(500).json({ mensagem: 'O serviço de recuperação de senha não está configurado.' });
  }

  try {
    const conta = await Modelo.findOne({ email: email.trim() });

    if (!conta) {
      return res.json({
        mensagem: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    conta.tokenRecuperacaoHash = crypto.createHash('sha256').update(token).digest('hex');
    conta.tokenRecuperacaoExpira = new Date(Date.now() + 60 * 60 * 1000);
    await conta.save();

    const linkRecuperacao = new URL(
      '/redefinir-senha',
      process.env.CLIENT_URL || 'http://localhost:3000'
    );
    linkRecuperacao.searchParams.set('token', token);
    linkRecuperacao.searchParams.set('tipo', tipo);

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Suporte" <${process.env.EMAIL_USER}>`,
        to: conta.email,
        subject: 'Recuperação de Senha',
        html: `
          <h2>Solicitação de Recuperação de Senha</h2>
          <p>Clique no link abaixo para redefinir sua senha. O link expira em uma hora.</p>
          <a href="${linkRecuperacao.toString()}">Redefinir senha</a>
          <p>Se você não solicitou isso, ignore este e-mail.</p>
        `,
      });
    } catch (erroEmail) {
      conta.tokenRecuperacaoHash = undefined;
      conta.tokenRecuperacaoExpira = undefined;
      await conta.save();
      throw erroEmail;
    }

    return res.json({
      mensagem: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
    });
  } catch (erro) {
    console.error('Erro ao solicitar recuperação de senha:', erro);
    return res.status(500).json({ mensagem: 'Não foi possível enviar o e-mail de recuperação.' });
  }
};

const redefinirSenha = async (req, res) => {
  const { token, senha, tipo = 'usuario' } = req.body;
  const Modelo = tipo === 'ong' ? Ong : tipo === 'usuario' ? Usuario : null;

  if (!Modelo || typeof token !== 'string' || !token) {
    return res.status(400).json({ mensagem: 'O link de recuperação é inválido ou expirou.' });
  }

  if (typeof senha !== 'string' || senha.length < 8) {
    return res.status(400).json({ mensagem: 'A senha deve ter pelo menos 8 caracteres.' });
  }

  try {
    const tokenRecuperacaoHash = crypto.createHash('sha256').update(token).digest('hex');
    const conta = await Modelo.findOne({
      tokenRecuperacaoHash,
      tokenRecuperacaoExpira: { $gt: new Date() },
    }).select('+tokenRecuperacaoHash +tokenRecuperacaoExpira');

    if (!conta) {
      return res.status(400).json({ mensagem: 'O link de recuperação é inválido ou expirou.' });
    }

    conta.senha = await bcrypt.hash(senha, 10);
    conta.tokenRecuperacaoHash = undefined;
    conta.tokenRecuperacaoExpira = undefined;
    await conta.save();

    return res.json({ mensagem: 'Senha redefinida com sucesso. Você já pode entrar com a nova senha.' });
  } catch (erro) {
    console.error('Erro ao redefinir senha:', erro);
    return res.status(500).json({ mensagem: 'Não foi possível redefinir a senha.' });
  }
};

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
      { userId: usuario._id, tipo: 'usuario' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      mensagem: 'Login bem-sucedido',
      token,
      imagem_perfil: usuario.imagem_perfil || ''
    });
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

    if (!senha || senha.trim() === '') {
      return res.status(400).json({ mensagem: 'A senha é obrigatória' });
    }

    if (senha.length < 8) {
      return res.status(400).json({ mensagem: 'A senha deve ter pelo menos 8 caracteres.' });
    }

    // Faz upload da imagem de perfil para o cloudinary caso houver
    let imagemUrl = '';
    if (req.file) {
      const resultadoUpload = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      imagemUrl = resultadoUpload.secure_url;
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = new Usuario({
      nome,
      login,
      email,
      senha: senhaHash,
      imagem_perfil: imagemUrl, //salva no bd a url da imagem na nuvem
    });

    await novoUsuario.save();

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// Realiza a edição ou update

const editarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, login, email, senha, imagem_perfil } = req.body;

  try {
    const usuarioEditar = await Usuario.findById(id);
    const usuarioIgual = email ? await Usuario.findOne({ email, _id: { $ne: id } }) : null;

    if (!usuarioEditar) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    if (usuarioIgual) {
      return res.status(400).json({ mensagem: 'Usuário com mesmo email já cadastrado' });
    }

    let senhaHashEditada;
    if (senha && senha.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      senhaHashEditada = await bcrypt.hash(senha, salt);
    }

    // cloudinary
    let novaImagem = imagem_perfil;
  if (req.file) {
      const resultadoUpload = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    novaImagem = resultadoUpload.secure_url;
  }

  if (nome) usuarioEditar.nome = nome;
  if (login) usuarioEditar.login = login;
  if (email) usuarioEditar.email = email;
  if (senhaHashEditada) usuarioEditar.senha = senhaHashEditada;
  if (novaImagem) usuarioEditar.imagem_perfil = novaImagem;

  await usuarioEditar.save();

  res.json({ mensagem: 'Usuário atualizado com sucesso', usuario: usuarioEditar });
} catch (error) {
  console.error(error);
  res.status(500).json({ mensagem: 'Erro ao atualizar usuário' });
}
};

const deletarUsuario = async (req, res) => {
  const { id } = req.params;
  const { senha } = req.body;

  try {
    if (typeof senha !== 'string' || senha.length === 0) {
      return res.status(400).json({ mensagem: 'A senha é obrigatória para deletar o usuário' });
    }

    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    const usuarioDeletar = await Usuario.findOneAndDelete({
      _id: id,
      senha: usuario.senha,
    });

    if (!usuarioDeletar) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.json({ mensagem: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao deletar Usuário' });
  }
};

const getPerfilUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório' });
    }

    const usuario = await Usuario.findById(id).select('nome login email imagem_perfil');

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const doacoes = await Doacao.find({ usuario: usuario._id })
      .select('ong createdAt')
      .populate('ong', 'nome logo')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      id: usuario._id,
      nome: usuario.nome,
      login: usuario.login,
      email: usuario.email,
      imagem_perfil: usuario.imagem_perfil,
      doacoes: doacoes.map((doacao) => ({
        ong: doacao.ong ? {
          id: doacao.ong._id,
          nome: doacao.ong.nome,
          logo: doacao.ong.logo
        } : null,
        data: doacao.createdAt
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};

module.exports = {
  loginUsuario,
  registrarUsuario,
  editarUsuario,
  deletarUsuario,
  getPerfilUsuario,
  solicitarRecuperacaoSenha,
  redefinirSenha,
};