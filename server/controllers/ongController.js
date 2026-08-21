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
  const { nome, login, email, senha, cnpj, cidade_regiao, categoria, logo, banner, carrossel, qrcode, chave_pix, instagram } = req.body;

  try {
    const ongExistente = await Ong.findOne({ email });

    if (ongExistente) {
      return res.status(400).json({ mensagem: 'Ong já cadastrada' });
    }

    // Processamento de mídias (Cloudinary)
    let logoUrl = logo || '';
    let bannerUrl = banner || '';
    let qrcodeUrl = qrcode || '';
    let carrosselUrls = carrossel || [];

    if (req.files) {
      // 1. Logo
      if (req.files.logo && req.files.logo[0]) {
        const uploadLogo = await uploadToCloudinary(req.files.logo[0].path);
        logoUrl = uploadLogo.secure_url;
      }

      // 2. Banner
      if (req.files.banner && req.files.banner[0]) {
        const uploadBanner = await uploadToCloudinary(req.files.banner[0].path);
        bannerUrl = uploadBanner.secure_url;
      }

      // 3. QR Code (ADICIONADO NO REGISTRO)
      if (req.files.qrcode && req.files.qrcode[0]) {
        const uploadQrCode = await uploadToCloudinary(req.files.qrcode[0].path);
        qrcodeUrl = uploadQrCode.secure_url;
      }

      // 4. Carrossel (Array de imagens)
      if (req.files.carrossel && req.files.carrossel.length > 0) {
        carrosselUrls = await Promise.all(
          req.files.carrossel.map(async (file) => {
            const upload = await uploadToCloudinary(file.path);
            return upload.secure_url;
          })
        );
      }
    }

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
      cidade_regiao,
      categoria,
      logo: logoUrl,
      banner: bannerUrl,
      qrcode: qrcodeUrl, // ADICIONADO AQUI
      carrossel: carrosselUrls,
      chave_pix,
      instagram
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


module.exports = {
  loginOng,
  registrarOng,
  editarOng,
  deletarOng,
};