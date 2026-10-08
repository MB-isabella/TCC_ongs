import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import './CadastrarOng.css';

const categoriaOpcoes = [
  'Meio Ambiente',
  'Saúde',
  'Educação',
  'Direitos Humanos',
  'Animais',
  'Alimentação',
  'Arte e Cultura',
  'Inclusão Social',
  'Comunidade',
  'Outros',
];

const gerarLoginAutomatico = (nome, email) => {
  const base = (nome || email || 'ong')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18);

  return `${base || 'ong'}${Math.random().toString(36).slice(2, 6)}`;
};

export default function CadastrarOng() {
  const navigate = useNavigate();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyMargin = body.style.margin;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.margin = '0';

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.margin = previousBodyMargin;
    };
  }, []);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [regiao, setRegiao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [instagram, setInstagram] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [qrcode, setQrcode] = useState(null);
  const [carrossel, setCarrossel] = useState([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [menuCategoriasAberto, setMenuCategoriasAberto] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const loginAutomatico = useMemo(
    () => gerarLoginAutomatico(nome, email),
    [nome, email]
  );

  const previewsCarrossel = useMemo(
    () => carrossel.map((arquivo) => ({ arquivo, url: URL.createObjectURL(arquivo) })),
    [carrossel]
  );

  const previewsCamposImagem = useMemo(() => ({
    qrcode: qrcode ? URL.createObjectURL(qrcode) : null,
    logo: logo ? URL.createObjectURL(logo) : null,
    banner: banner ? URL.createObjectURL(banner) : null,
  }), [qrcode, logo, banner]);

  useEffect(() => () => {
    previewsCarrossel.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [previewsCarrossel]);

  useEffect(() => () => {
    Object.values(previewsCamposImagem).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  }, [previewsCamposImagem]);

  const alternarCategoria = (categoria) => {
    setCategoriasSelecionadas((prev) =>
      prev.includes(categoria)
        ? prev.filter((item) => item !== categoria)
        : [...prev, categoria]
    );
  };

  const removerCategoria = (categoria) => {
    setCategoriasSelecionadas((prev) => prev.filter((item) => item !== categoria));
  };

  const selecionarImagem = (evento, setter, nomeCampo) => {
    const arquivo = evento.currentTarget.files?.[0] || null;
    evento.currentTarget.value = '';

    if (arquivo && !arquivo.type.startsWith('image/')) {
      setter(null);
      setMensagem(`Arquivo inválido (${nomeCampo}): selecione um arquivo de imagem.`);
      return;
    }

    setter(arquivo);
    setMensagem('');
  };

  const adicionarImagensCarrossel = (evento) => {
    const arquivosNovos = Array.from(evento.currentTarget.files || []);
    evento.currentTarget.value = '';

    const arquivoInvalido = arquivosNovos.find((arquivo) => !arquivo.type.startsWith('image/'));
    if (arquivoInvalido) {
      setMensagem(`Arquivo inválido (Carrossel): "${arquivoInvalido.name}" não é uma imagem.`);
      return;
    }

    const identificadoresAtuais = new Set(
      carrossel.map((arquivo) => `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`)
    );
    const quantidadeNova = arquivosNovos.filter((arquivo) => {
      const identificador = `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`;
      if (identificadoresAtuais.has(identificador)) return false;
      identificadoresAtuais.add(identificador);
      return true;
    }).length;
    if (carrossel.length + quantidadeNova > 5) {
      setMensagem('Limite do carrossel: selecione no máximo 5 imagens no total. As imagens já adicionadas foram mantidas.');
    } else {
      setMensagem('');
    }

    setCarrossel((arquivosAtuais) => {
      const identificadores = new Set(
        arquivosAtuais.map((arquivo) => `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`)
      );
      const novosSemDuplicatas = arquivosNovos.filter((arquivo) => {
        const identificador = `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`;
        if (identificadores.has(identificador)) return false;
        identificadores.add(identificador);
        return true;
      });

      return [...arquivosAtuais, ...novosSemDuplicatas].slice(0, 5);
    });
  };

  const removerImagemCarrossel = (indice) => {
    setCarrossel((arquivosAtuais) => arquivosAtuais.filter((_, index) => index !== indice));
    setMensagem('');
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setMensagem('');

    if (!nome.trim()) return setMensagem('Campo obrigatório (Nome da ONG): informe o nome da organização.');
    if (!email.trim()) return setMensagem('Campo obrigatório (E-mail): informe um endereço de e-mail.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setMensagem('E-mail inválido: confira o endereço informado.');
    if (!/^\d{14}$/.test(cnpj.replace(/\D/g, ''))) return setMensagem('CNPJ inválido: informe os 14 dígitos do CNPJ.');
    if (!regiao.trim()) return setMensagem('Campo obrigatório (Região): informe a região da ONG.');
    if (!descricao.trim()) return setMensagem('Campo obrigatório (Descrição): apresente brevemente a ONG.');
    if (categoriasSelecionadas.length === 0) return setMensagem('Campo obrigatório (Categoria): selecione ao menos uma categoria.');
    if (!qrcode) return setMensagem('Campo obrigatório (QR Code PIX): selecione a imagem do QR Code.');
    if (!chavePix.trim()) return setMensagem('Campo obrigatório (Chave PIX): informe uma chave PIX válida.');
    if (!logo) return setMensagem('Campo obrigatório (Logo): selecione a imagem da ONG.');
    if (!banner) return setMensagem('Campo obrigatório (Banner): selecione a imagem do banner.');
    if (carrossel.length === 0) return setMensagem('Campo obrigatório (Carrossel): selecione ao menos uma imagem.');

    setCarregando(true);

    try {
      const loginFinal = loginAutomatico || 'ong';
      const senhaFinal = `${(cnpj || 'ong').replace(/\D/g, '').slice(-8) || 'ong'}@2026`;
      const cidadeRegiao = regiao.trim();

      const dados = new FormData();
      dados.append('nome', nome);
      dados.append('login', loginFinal);
      dados.append('email', email);
      dados.append('senha', senhaFinal);
      dados.append('cnpj', cnpj);
      dados.append('cidade_regiao', cidadeRegiao);
      dados.append('descricao', descricao);
      dados.append('instagram', instagram);
      dados.append('chave_pix', chavePix);

      categoriasSelecionadas.forEach((categoria) => {
        dados.append('categoria', categoria);
      });

      if (logo) dados.append('logo', logo);
      if (banner) dados.append('banner', banner);
      if (qrcode) dados.append('qrcode', qrcode);
      carrossel.forEach((arquivo) => dados.append('carrossel', arquivo));

      const resposta = await fetch('http://localhost:7777/ong/registrar-ong', {
        method: 'POST',
        body: dados,
      });

      const retorno = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(retorno.mensagem || `Falha no cadastro (HTTP ${resposta.status}): o servidor não conseguiu concluir o pedido.`);
      }

      setMensagem('ONG cadastrada com sucesso.');
      setTimeout(() => navigate('/login-ong'), 1200);
    } catch (erro) {
      setMensagem(erro instanceof TypeError
        ? 'Falha de conexão: não foi possível acessar o servidor. Verifique se ele está ligado e tente novamente.'
        : erro.message || 'Erro inesperado: não foi possível concluir o cadastro. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="pagina-cadastro-ong">
      <aside
        className="lateral-cadastro-ong"
        style={{ backgroundImage: "linear-gradient(90deg, rgba(67, 0, 5, .18), rgba(67, 0, 5, .06)), url('/images/telainicialfundo.png')" }}
      >
        <div className="topo-lateral-cadastro-ong">
          <Link to="/" className="voltar-cadastro-ong">Voltar para o início</Link>
          <Link to="/" className="marca-cadastro-ong" aria-label="Página inicial">♡</Link>
        </div>

        <div className="chamada-lateral-cadastro-ong">
          <p>Já tem uma conta?</p>
          <h2>Bem-vindo de<br />volta!</h2>
          <Link to="/login-ong" className="botao-login-cadastro-ong">Entrar</Link>
        </div>
      </aside>

      <section className="conteudo-cadastro-ong">
        <div className="cabecalho-cadastro-ong">
          <Link to="/cadastro-usuario" className="link-cadastro-usuario-ong">Deseja cadastrar um usuário?</Link>
          <h1>Cadastro de ONG</h1>
        </div>

        <form className="formulario-cadastro-ong" onSubmit={handleSubmit} noValidate>
          <div className="grupo-campo-ong">
            <div>
              <label htmlFor="nome-ong">Nome</label>
              <input id="nome-ong" value={nome} onChange={(evento) => setNome(evento.target.value)} required />
            </div>

            <div>
              <label htmlFor="email-ong">E-mail</label>
              <input id="email-ong" type="email" value={email} onChange={(evento) => setEmail(evento.target.value)} required />
            </div>

            <div>
              <label htmlFor="cnpj-ong">CNPJ</label>
              <input id="cnpj-ong" value={cnpj} onChange={(evento) => setCnpj(evento.target.value)} required />
            </div>

            <div>
              <label htmlFor="regiao-ong">Região</label>
              <input id="regiao-ong" value={regiao} onChange={(evento) => setRegiao(evento.target.value)} placeholder="Cidade ou área de atuação" required />
            </div>

            <div>
              <label htmlFor="descricao-ong">Descrição</label>
              <textarea id="descricao-ong" value={descricao} onChange={(evento) => setDescricao(evento.target.value)} placeholder="Ex: o que fazemos, tempo de atuação, time, eventos..." required />
            </div>

            <div className="campo-categoria-ong">
              <label>Categoria(s)</label>
              <button type="button" className="botao-seletor-categoria" onClick={() => setMenuCategoriasAberto((prev) => !prev)}>
                {categoriasSelecionadas.length > 0 ? categoriasSelecionadas.join(', ') : 'Selecione as categorias'}
              </button>

              {menuCategoriasAberto && (
                <div className="lista-categorias-ong">
                  {categoriaOpcoes.map((categoria) => (
                    <button
                      key={categoria}
                      type="button"
                      className={`item-categoria-ong ${categoriasSelecionadas.includes(categoria) ? 'selecionado' : ''}`}
                      onClick={() => alternarCategoria(categoria)}
                    >
                      {categoria}
                    </button>
                  ))}
                </div>
              )}

              <div className="chips-categorias-ong">
                {categoriasSelecionadas.map((categoria) => (
                  <span key={categoria} className="chip-categoria-ong">
                    {categoria}
                    <button type="button" aria-label={`Remover ${categoria}`} onClick={() => removerCategoria(categoria)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="instagram-ong">Instagram</label>
              <input id="instagram-ong" value={instagram} onChange={(evento) => setInstagram(evento.target.value)} placeholder="@exemplo" />
            </div>
          </div>

          <div className="secao-cadastro-ong">
            <h2>Informações bancárias para doações</h2>

            <div className="duas-colunas-ong">
              <div className="bloco-upload-ong">
                <label className="label-upload-ong" htmlFor="qrcode-ong">QR Code PIX</label>
                <input
                  id="qrcode-ong"
                  className="entrada-arquivo-ong"
                  type="file"
                  accept="image/*"
                  onChange={(evento) => selecionarImagem(evento, setQrcode, 'QR Code PIX')}
                />
                <label htmlFor="qrcode-ong" className={`area-upload-ong ${qrcode ? 'tem-arquivo' : ''}`}>
                  <span className="conteudo-upload">
                    {previewsCamposImagem.qrcode ? (
                      <img className="preview-imagem-upload-ong" src={previewsCamposImagem.qrcode} alt={`Prévia de ${qrcode.name}`} />
                    ) : (
                      <>
                        <img className="icone-upload-ong" src="/images/imagemicone.png" alt="" />
                        <span>Escolher QR Code</span>
                      </>
                    )}
                  </span>
                </label>
                <p className="aviso-upload-ong">! Tenha certeza de que o QR Code não possua validade</p>
              </div>

              <div>
                <label htmlFor="chave-pix-ong">Chave PIX</label>
                <input id="chave-pix-ong" value={chavePix} onChange={(evento) => setChavePix(evento.target.value)} />
                <p className="aviso-upload-ong">! Não utilize chaves-pix contendo CPF</p>
              </div>
            </div>
          </div>

          <div className="secao-cadastro-ong">
            <h2>Imagens</h2>

            <div className="duas-colunas-ong">
              <div className="bloco-upload-ong">
                <label className="label-upload-ong" htmlFor="logo-ong">Logo</label>
                <input id="logo-ong" className="entrada-arquivo-ong" type="file" accept="image/*" onChange={(evento) => selecionarImagem(evento, setLogo, 'Logo')} />
                <label htmlFor="logo-ong" className={`area-upload-ong ${logo ? 'tem-arquivo' : ''}`}>
                  <span className="conteudo-upload">
                    {previewsCamposImagem.logo ? (
                      <img className="preview-imagem-upload-ong" src={previewsCamposImagem.logo} alt={`Prévia de ${logo.name}`} />
                    ) : (
                      <>
                        <img className="icone-upload-ong" src="/images/imagemicone.png" alt="" />
                        <span>Escolher logo</span>
                      </>
                    )}
                  </span>
                </label>
              </div>

              <div className="bloco-upload-ong">
                <label className="label-upload-ong" htmlFor="banner-ong">Banner</label>
                <input id="banner-ong" className="entrada-arquivo-ong" type="file" accept="image/*" onChange={(evento) => selecionarImagem(evento, setBanner, 'Banner')} />
                <label htmlFor="banner-ong" className={`area-upload-ong ${banner ? 'tem-arquivo' : ''}`}>
                  <span className="conteudo-upload">
                    {previewsCamposImagem.banner ? (
                      <img className="preview-imagem-upload-ong" src={previewsCamposImagem.banner} alt={`Prévia de ${banner.name}`} />
                    ) : (
                      <>
                        <img className="icone-upload-ong" src="/images/imagemicone.png" alt="" />
                        <span>Escolher banner</span>
                      </>
                    )}
                  </span>
                </label>
              </div>
            </div>

            <div className="bloco-upload-ong carrossel-upload-ong">
              <label className="label-upload-ong" htmlFor="carrossel-ong">Imagens do Carrossel</label>
              <input
                id="carrossel-ong"
                className="entrada-arquivo-ong"
                type="file"
                accept="image/*"
                multiple
                onChange={adicionarImagensCarrossel}
              />
              <label htmlFor="carrossel-ong" className={`area-upload-ong carrossel-area ${carrossel.length ? 'tem-arquivo' : ''}`}>
                <span className="conteudo-upload">
                  <img className="icone-upload-ong" src="/images/imagemicone.png" alt="" />
                  <span>{carrossel.length > 0 ? `Adicionar imagens (${carrossel.length}/5)` : 'Escolher imagens do carrossel'}</span>
                </span>
              </label>
              {previewsCarrossel.length > 0 && (
                <div className="previews-carrossel-ong" aria-label="Arquivos selecionados para o carrossel">
                  {previewsCarrossel.map(({ arquivo, url }, index) => (
                    <div className="item-preview-carrossel-ong" key={`${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`} title={arquivo.name}>
                      <button
                        type="button"
                        className="remover-imagem-carrossel"
                        aria-label={`Remover imagem ${arquivo.name}`}
                        onClick={() => removerImagemCarrossel(index)}
                      >
                        ×
                      </button>
                      <img src={url} alt={`Prévia de ${arquivo.name}`} />
                      <span>{arquivo.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="aviso-upload-ong">! Min 1, Máx 5</p>
            </div>
          </div>

          {mensagem && <p className="mensagem-cadastro-ong" role="status">{mensagem}</p>}

          <button className="botao-enviar-cadastro-ong" type="submit" disabled={carregando}>
            {carregando ? 'Enviando...' : 'Cadastrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
