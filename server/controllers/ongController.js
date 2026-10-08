const bcrypt = require('bcryptjs');
const { uploadToCloudinary } = require('../routes/cloudinary');
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

// Realizar registro
const registrarOng = async (req, res) => {
  const { nome, login, email, senha, cnpj, cidade_regiao, categoria, chave_pix, instagram, descricao } = req.body;

  try {
    if (!nome || !nome.trim()) {
      return res.status(400).json({ mensagem: 'Campo obrigatório (Nome da ONG): informe o nome da organização.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ mensagem: 'Campo obrigatório (E-mail): informe um endereço de e-mail.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ mensagem: 'E-mail inválido: confira o endereço informado.' });
    }

    if (!cnpj || !/^\d{14}$/.test(cnpj.replace(/\D/g, ''))) {
      return res.status(400).json({ mensagem: 'CNPJ inválido: informe os 14 dígitos do CNPJ.' });
    }

    if (!descricao || !descricao.trim()) {
      return res.status(400).json({ mensagem: 'Campo obrigatório (Descrição): apresente brevemente a ONG.' });
    }

    if (!login || !login.trim()) {
      return res.status(400).json({ mensagem: 'Campo obrigatório (Login): não foi possível gerar o login da ONG.' });
    }

    if (!senha || !senha.trim()) {
      return res.status(400).json({ mensagem: 'Campo obrigatório (Senha): não foi possível gerar a senha inicial.' });
    }

    const ongExistente = await Ong.findOne({ email });

    if (ongExistente) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado: já existe uma ONG usando este endereço.' });
    }

    const categorias = Array.isArray(categoria)
      ? categoria.filter(Boolean)
      : typeof categoria === 'string'
        ? categoria.split(',').map((item) => item.trim()).filter(Boolean)
        : [];

    if (categorias.length === 0) {
      return res.status(400).json({ mensagem: 'Campo obrigatório (Categoria): selecione ao menos uma categoria.' });
    }

    const arquivos = req.files || {};
    const arquivoLogo = arquivos.logo?.[0];
    const arquivoBanner = arquivos.banner?.[0];
    const arquivoQrCode = arquivos.qrcode?.[0];
    const arquivosCarrossel = arquivos.carrossel || [];

    if (!arquivoLogo) return res.status(400).json({ mensagem: 'Campo obrigatório (Logo): selecione a imagem da ONG.' });
    if (!arquivoBanner) return res.status(400).json({ mensagem: 'Campo obrigatório (Banner): selecione a imagem do banner.' });
    if (!arquivoQrCode) return res.status(400).json({ mensagem: 'Campo obrigatório (QR Code PIX): selecione a imagem do QR Code.' });
    if (!chave_pix || !chave_pix.trim()) return res.status(400).json({ mensagem: 'Campo obrigatório (Chave PIX): informe uma chave PIX válida.' });
    if (arquivosCarrossel.length === 0) return res.status(400).json({ mensagem: 'Campo obrigatório (Carrossel): selecione ao menos uma imagem.' });

    // Processamento de mídias (Cloudinary)
    const enviarImagem = async (arquivo, campo) => {
      try {
        const resultado = await uploadToCloudinary(arquivo.buffer, arquivo.originalname);
        return resultado.secure_url;
      } catch (erro) {
        console.error(`Falha no envio da imagem (${campo}):`, erro);
        const mensagem = erro.message?.startsWith('Configuração do Cloudinary incompleta')
          ? `Armazenamento não configurado (${campo}): o servidor precisa configurar o serviço de imagens.`
          : `Falha no envio da imagem (${campo}): o serviço de armazenamento não recebeu o arquivo. Tente novamente.`;
        const erroIdentificado = new Error(mensagem);
        erroIdentificado.codigo = 'FALHA_UPLOAD_IMAGEM';
        throw erroIdentificado;
      }
    };

    const [logoUrl, bannerUrl, qrcodeUrl] = await Promise.all([
      enviarImagem(arquivoLogo, 'Logo'),
      enviarImagem(arquivoBanner, 'Banner'),
      enviarImagem(arquivoQrCode, 'QR Code PIX'),
    ]);
    const carrosselUrls = await Promise.all(
      arquivosCarrossel.map((arquivo) => enviarImagem(arquivo, 'Carrossel'))
    );

    // Criptografia da senha
    let senhaHashEditada;
    if (senha && senha.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      senhaHashEditada = await bcrypt.hash(senha, salt);
    }
    
    const novaOng = new Ong({
      nome,
      login,
      email,
      senha: senhaHashEditada,
      cnpj,
      cidade_regiao: cidade_regiao || 'Brasil',
      categoria: categorias,
      descricao: descricao || '',
      logo: logoUrl,
      banner: bannerUrl,
      qrcode: qrcodeUrl,
      carrossel: carrosselUrls,
      chave_pix: chave_pix || '',
      instagram
    });

    await novaOng.save();

    res.status(201).json({ mensagem: 'Ong cadastrada com sucesso' });
  } catch (erro) {
    console.error('Falha no cadastro da ONG:', erro);

    if (erro.code === 11000) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado: já existe uma ONG usando este endereço.' });
    }

    if (erro.name === 'ValidationError') {
      const campos = Object.keys(erro.errors || {}).map((campo) => ({
        nome: { nome: 'Nome da ONG', login: 'Login', email: 'E-mail', senha: 'Senha', cnpj: 'CNPJ', cidade_regiao: 'Cidade/região', categoria: 'Categoria', banner: 'Banner', logo: 'Logo', carrossel: 'Carrossel', qrcode: 'QR Code PIX', chave_pix: 'Chave PIX' }[campo] || campo,
      }).nome);
      return res.status(400).json({ mensagem: `Dados inválidos (${campos.join(', ')}): confira os campos informados.` });
    }

    if (erro.name === 'MongooseServerSelectionError' || erro.name === 'MongoNetworkError') {
      return res.status(503).json({ mensagem: 'Banco de dados indisponível: não foi possível salvar o cadastro. Tente novamente mais tarde.' });
    }

    if (erro.codigo === 'FALHA_UPLOAD_IMAGEM' || erro.message?.startsWith('Armazenamento não configurado')) {
      return res.status(502).json({ mensagem: erro.message });
    }

    return res.status(500).json({ mensagem: 'Falha no cadastro da ONG: ocorreu um erro inesperado no servidor. Tente novamente mais tarde.' });
  }
};

const editarOng = async (req, res) => {
  const { id } = req.params;
  const { nome, login, email, senha, cnpj, cidade_regiao, categoria, logo, banner, carrossel, qrcode, chave_pix, instagram,
    fotos_remover // Array de URLs das fotos que o usuário deseja EXCLUIR do carrossel ex: ["https://res.cloudinary..."]
  } = req.body;

  try {
    const ongEditar = await Ong.findById(id);

    if (!ongEditar) {
      return res.status(404).json({ mensagem: 'Ong não encontrada' });
    }

    if (senha && senha.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      ongEditar.senha = await bcrypt.hash(senha, salt);
    }

    // 2. UPLOADS INDIVIDUAIS (Logo, Banner, QR Code)
    if (req.files) {
      if (req.files['logo'] && req.files['logo'][0]) {
        const uploadLogo = await uploadToCloudinary(req.files['logo'][0].path);
        ongEditar.logo = uploadLogo.secure_url;
      } else if (logo) {
        ongEditar.logo = logo;
      }

      if (req.files['banner'] && req.files['banner'][0]) {
        const uploadBanner = await uploadToCloudinary(req.files['banner'][0].path);
        ongEditar.banner = uploadBanner.secure_url;
      } else if (banner) {
        ongEditar.banner = banner;
      }

      if (req.files['qrcode'] && req.files['qrcode'][0]) {
        const uploadQrCode = await uploadToCloudinary(req.files['qrcode'][0].path);
        ongEditar.qrcode = uploadQrCode.secure_url;
      } else if (qrcode) {
        ongEditar.qrcode = qrcode;
      }
    } else {
      // Se não houver envio de arquivos novos pelo req.files, atualiza se forem passadas strings no req.body
      if (logo) ongEditar.logo = logo;
      if (banner) ongEditar.banner = banner;
      if (qrcode) ongEditar.qrcode = qrcode;
    }

    // 3. REMOVER FOTOS ESPECÍFICAS DO CARROSSEL
    if (fotos_remover) {
      // Aceita tanto uma string única quanto um array de URLs
      const urlsParaRemover = Array.isArray(fotos_remover) ? fotos_remover : [fotos_remover];
      
      ongEditar.carrossel = ongEditar.carrossel.filter(
        (urlExistente) => !urlsParaRemover.includes(urlExistente)
      );
    }

    // 4. ADICIONAR NOVAS FOTOS AO CARROSSEL (acumula com as que já existem)
    if (req.files && req.files['carrossel'] && req.files['carrossel'].length > 0) {
      const uploadsNovos = await Promise.all(
        req.files['carrossel'].map((file) => uploadToCloudinary(file.path))
      );
      const novasUrls = uploadsNovos.map((item) => item.secure_url);

      // Adiciona as novas imagens mantendo as antigas que não foram removidas
      ongEditar.carrossel.push(...novasUrls);
    }

    // 5. Atualização dos demais campos de texto
    if (nome) ongEditar.nome = nome;
    if (login) ongEditar.login = login;
    if (email) ongEditar.email = email;
    if (cnpj) ongEditar.cnpj = cnpj;
    if (cidade_regiao) ongEditar.cidade_regiao = cidade_regiao;
    if (categoria) ongEditar.categoria = categoria;
    if (chave_pix) ongEditar.chave_pix = chave_pix;
    if (instagram) ongEditar.instagram = instagram;

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
    const ongDeletar = await Ong.findOneAndDelete({ _id: id });

    if (!ongDeletar) {
      return res.status(404).json({ mensagem: 'Ong não encontrada' });
    }

    res.json({ mensagem: 'Ong deletada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao deletar Ong' });
  }
};

const getPerfilOngsProprietario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'ID da ONG é obrigatório' });
    }

    const ong = await Ong.findById(id).select('nome email cnpj cidade_regiao categoria banner logo carrossel instagram');

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
      carrossel: ong.carrossel,
      instagram: ong.instagram,
      qrcode: ong.qrcode,
      chave_pix: ong.chave_pix
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar ONG' });
  }
};



module.exports = {
  loginOng,
  registrarOng,
  editarOng,
  deletarOng,
  getPerfilOngsProprietario
};