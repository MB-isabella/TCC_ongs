const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Usuario = require('../models/usuario');
const Ong = require('../models/ong');

const obterModeloConta = (tipo) => {
  if (tipo === 'ong') return Ong;
  if (tipo === 'usuario') return Usuario;
  return null;
};

const solicitarRecuperacaoSenha = async (req, res) => {
  const { email, tipo } = req.body;
  const Modelo = obterModeloConta(tipo);

  if (!Modelo || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ mensagem: 'Informe um e-mail válido e selecione o tipo de conta.' });
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
      process.env.CLIENT_URL || 'https://unilinorte.vercel.app'
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
  const { token, senha, tipo } = req.body;
  const Modelo = obterModeloConta(tipo);

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

module.exports = {
  solicitarRecuperacaoSenha,
  redefinirSenha,
};
