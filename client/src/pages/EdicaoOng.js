import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BarraCatalogo from '../components/BarraCatalogo';
import {
	editarOng,
	getDadosSessao,
	getPerfilOngsProprietario,
} from '../services/catalogo';

function CampoEditavel({
	id,
	label,
	value,
	onChange,
	type = 'text',
	multiline = false,
	icon,
	required = true,
}) {
	const Campo = multiline ? 'textarea' : 'input';
	return (
		<div className={`campo-edicao-ong${multiline ? ' campo-descricao-edicao-ong' : ''}`}>
			<label htmlFor={id}>
				{icon && <img src={icon} alt="" />}
				<span>{label}</span>
			</label>
			<div className="entrada-edicao-ong">
				<Campo
					id={id}
					type={multiline ? undefined : type}
					value={value}
					onChange={(evento) => onChange(evento.target.value)}
					required={required}
					rows={multiline ? 7 : undefined}
				/>
				<img className="lapis-campo-edicao-ong" src="/images/lapisinho.png" alt="" />
			</div>
		</div>
	);
}

export default function EdicaoOng() {
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const ongId = sessao?.id;
	const ongAutenticada = Boolean(ongId && sessao?.tipo === 'ong');
	const bannerInputRef = useRef(null);
	const logoInputRef = useRef(null);
	const qrcodeInputRef = useRef(null);
	const carrosselInputRef = useRef(null);
	const [ong, setOng] = useState(null);
	const [carregandoPerfil, setCarregandoPerfil] = useState(true);
	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState('');
	const [nome, setNome] = useState('');
	const [login, setLogin] = useState('');
	const [instagram, setInstagram] = useState('');
	const [email, setEmail] = useState('');
	const [cnpj, setCnpj] = useState('');
	const [regiao, setRegiao] = useState('');
	const [descricao, setDescricao] = useState('');
	const [chavePix, setChavePix] = useState('');
	const [banner, setBanner] = useState(null);
	const [logo, setLogo] = useState(null);
	const [qrcode, setQrcode] = useState(null);
	const [imagensNovas, setImagensNovas] = useState([]);
	const [imagensRemover, setImagensRemover] = useState([]);

	const bannerPreview = useMemo(() => (banner ? URL.createObjectURL(banner) : ''), [banner]);
	const logoPreview = useMemo(() => (logo ? URL.createObjectURL(logo) : ''), [logo]);
	const qrcodePreview = useMemo(() => (qrcode ? URL.createObjectURL(qrcode) : ''), [qrcode]);
	const previewsCarrossel = useMemo(
		() => imagensNovas.map(({ id, arquivo }) => ({ id, arquivo, url: URL.createObjectURL(arquivo) })),
		[imagensNovas]
	);

	useEffect(() => () => {
		[...previewsCarrossel.map(({ url }) => url), bannerPreview, logoPreview, qrcodePreview]
			.filter(Boolean)
			.forEach((url) => URL.revokeObjectURL(url));
	}, [previewsCarrossel, bannerPreview, logoPreview, qrcodePreview]);

	useEffect(() => {
		if (!ongAutenticada) return undefined;

		const controller = new AbortController();
		getPerfilOngsProprietario(ongId, controller.signal)
			.then((dados) => {
				setOng(dados);
				setNome(dados.nome || '');
				setLogin(dados.login || '');
				setInstagram(dados.instagram || '');
				setEmail(dados.email || '');
				setCnpj(dados.cnpj || '');
				setRegiao(dados.cidade_regiao || '');
				setDescricao(dados.descricao || '');
				setChavePix(dados.chave_pix || '');
			})
			.catch((erroRequisicao) => {
				if (erroRequisicao.name !== 'AbortError') setErro(erroRequisicao.message);
			})
			.finally(() => {
				if (!controller.signal.aborted) setCarregandoPerfil(false);
			});

		return () => controller.abort();
	}, [ongAutenticada, ongId]);

	if (!ongAutenticada) {
		return <Navigate to="/login-ong" replace state={{ from: { pathname: '/editar-perfil-ong' } }} />;
	}

	const carrosselAtual = (ong?.carrossel || [])
		.filter((url) => !imagensRemover.includes(url))
		.map((url) => ({ id: url, url, existente: true }));
	const carrosselVisivel = [
		...carrosselAtual,
		...previewsCarrossel.map((imagem) => ({ ...imagem, existente: false })),
	];

	const selecionarImagem = (evento, setter, rotulo) => {
		const arquivo = evento.currentTarget.files?.[0] || null;
		evento.currentTarget.value = '';
		if (!arquivo) return;
		if (!arquivo.type.startsWith('image/')) {
			setErro(`Arquivo inválido (${rotulo}): selecione uma imagem.`);
			return;
		}
		setErro('');
		setter(arquivo);
	};

	const adicionarImagens = (evento) => {
		const arquivos = Array.from(evento.currentTarget.files || []);
		evento.currentTarget.value = '';
		if (arquivos.some((arquivo) => !arquivo.type.startsWith('image/'))) {
			setErro('O carrossel aceita somente arquivos de imagem.');
			return;
		}

		const atuais = carrosselVisivel.length;
		const permitidas = Math.max(0, 5 - atuais);
		const novos = arquivos.slice(0, permitidas).map((arquivo) => ({
			id: `${Date.now()}-${Math.random()}-${arquivo.name}`,
			arquivo,
		}));
		setImagensNovas((anteriores) => [...anteriores, ...novos]);
		setErro(arquivos.length > permitidas
			? 'O carrossel aceita no máximo 5 imagens.'
			: '');
	};

	const removerImagem = (imagem) => {
		if (imagem.existente) {
			setImagensRemover((anteriores) => [...anteriores, imagem.url]);
		} else {
			setImagensNovas((anteriores) => anteriores.filter(({ id }) => id !== imagem.id));
		}
		setErro('');
	};

	const salvarEdicao = async (evento) => {
		evento.preventDefault();
		setErro('');

		if (carrosselVisivel.length < 1 || carrosselVisivel.length > 5) {
			setErro('O carrossel precisa conter de 1 a 5 imagens.');
			return;
		}

		setSalvando(true);
		const dados = new FormData();
		dados.append('nome', nome);
		dados.append('login', login);
		dados.append('email', email);
		dados.append('cnpj', cnpj);
		dados.append('cidade_regiao', regiao);
		dados.append('descricao', descricao);
		dados.append('instagram', instagram);
		dados.append('chave_pix', chavePix);
		if (banner) dados.append('banner', banner);
		if (logo) dados.append('logo', logo);
		if (qrcode) dados.append('qrcode', qrcode);
		imagensRemover.forEach((url) => dados.append('fotos_remover', url));
		imagensNovas.forEach(({ arquivo }) => dados.append('carrossel', arquivo));

		try {
			await editarOng(ongId, dados);
			navigate('/perfil-ong-proprietario', { replace: true });
		} catch (erroRequisicao) {
			setErro(erroRequisicao.message || 'Não foi possível salvar as alterações.');
		} finally {
			setSalvando(false);
		}
	};

	const encerrarSessao = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('tipoConta');
		localStorage.removeItem('imagemPerfil');
		navigate('/');
	};

	return (
		<div className="pagina-edicao-ong">
			<BarraCatalogo
				imagemPerfil={ong?.logo}
				destinoPerfil="/perfil-ong-proprietario"
				rotuloPerfil="Perfil da ONG"
				aoSair={encerrarSessao}
			/>

			<main className="conteudo-edicao-ong conteudo-com-barra-catalogo">
				{carregandoPerfil && <p className="status-edicao-ong" role="status">Carregando dados da ONG...</p>}
				{erro && !ong && <p className="mensagem-edicao-ong erro-edicao-ong" role="alert">{erro}</p>}
				{ong && (
					<form className="painel-edicao-ong" onSubmit={salvarEdicao}>
						<section className="cabecalho-edicao-ong" aria-label="Banner e logo">
							<button
								className="banner-preview-edicao-ong botao-imagem-banner-edicao-ong"
								type="button"
								onClick={() => bannerInputRef.current?.click()}
								aria-label="Editar banner"
							>
								{bannerPreview || ong.banner
									? <img src={bannerPreview || ong.banner} alt="" />
									: <span />}
							</button>
							<button className="botao-cancelar-edicao-ong hover-botao-vermelho" type="button" onClick={() => navigate('/perfil-ong-proprietario')}>
								Cancelar
							</button>
							<input
								ref={bannerInputRef}
								className="input-arquivo-edicao-ong"
								type="file"
								accept="image/*"
								onChange={(evento) => selecionarImagem(evento, setBanner, 'Banner')}
								aria-label="Selecionar banner"
							/>
							<button className="botao-lapis-banner-edicao-ong" type="button" onClick={() => bannerInputRef.current?.click()} aria-label="Editar banner">
								<img src="/images/lapisinho.png" alt="" />
							</button>
							<div className="logo-edicao-ong">
								<button
									className="botao-imagem-logo-edicao-ong"
									type="button"
									onClick={() => logoInputRef.current?.click()}
									aria-label="Editar logo"
								>
									<img src={logoPreview || ong.logo || '/images/usuariobranco.png'} alt="" />
								</button>
								<input
									ref={logoInputRef}
									className="input-arquivo-edicao-ong"
									type="file"
									accept="image/*"
									onChange={(evento) => selecionarImagem(evento, setLogo, 'Logo')}
									aria-label="Selecionar logo"
								/>
								<button className="botao-lapis-logo-edicao-ong" type="button" onClick={() => logoInputRef.current?.click()} aria-label="Editar logo">
									<img src="/images/lapisinho.png" alt="" />
								</button>
							</div>
						</section>

						<div className="identidade-form-edicao-ong">
							<CampoEditavel id="nome-edicao-ong" label="Nome da ONG" value={nome} onChange={setNome} />
							<CampoEditavel id="login-edicao-ong" label="Nome de usuário" value={login} onChange={setLogin} />
						</div>

						<div className="dados-form-edicao-ong">
							<CampoEditavel id="instagram-edicao-ong" label="Perfil Instagram" value={instagram} onChange={setInstagram} icon="/images/instagram.png" required={false} />
							<CampoEditavel id="email-edicao-ong" label="E-mail" value={email} onChange={setEmail} type="email" />
							<CampoEditavel id="cnpj-edicao-ong" label="CNPJ" value={cnpj} onChange={setCnpj} />
							<CampoEditavel id="regiao-edicao-ong" label="Região" value={regiao} onChange={setRegiao} />
						</div>

						<div className="detalhes-form-edicao-ong">
							<CampoEditavel
								id="descricao-edicao-ong"
								label="Sobre nós"
								value={descricao}
								onChange={setDescricao}
								multiline
								icon="/images/infoong.png"
							/>
							<section className="galeria-edicao-ong" aria-labelledby="titulo-galeria-edicao-ong">
								<h2 id="titulo-galeria-edicao-ong">Adicionar/Remover fotos</h2>
								<input
									ref={carrosselInputRef}
									className="input-arquivo-edicao-ong"
									type="file"
									accept="image/*"
									multiple
									onChange={adicionarImagens}
									aria-label="Adicionar fotos ao carrossel"
								/>
								<button
									className="botao-lapis-galeria-edicao-ong"
									type="button"
									onClick={() => carrosselInputRef.current?.click()}
									disabled={carrosselVisivel.length >= 5}
									aria-label="Adicionar fotos"
								>
									<img src="/images/lapisinho.png" alt="" />
								</button>
								<div className="grade-fotos-edicao-ong">
									{carrosselVisivel.map((imagem) => (
										<div className="foto-edicao-ong" key={imagem.id}>
											<img src={imagem.url} alt="Foto do carrossel da ONG" />
											<button type="button" onClick={() => removerImagem(imagem)} aria-label="Remover foto">×</button>
										</div>
									))}
									{carrosselVisivel.length === 0 && <p>Adicione pelo menos uma foto.</p>}
								</div>
								<span className="contador-fotos-edicao-ong">{carrosselVisivel.length}/5 fotos</span>
							</section>
						</div>

						<div className="pagamento-form-edicao-ong">
							<div className="campo-imagem-edicao-ong">
								<label htmlFor="qrcode-edicao-ong">Alterar QR Code</label>
								<div className="preview-qrcode-edicao-ong">
									<button
										className="botao-imagem-qrcode-edicao-ong"
										type="button"
										onClick={() => qrcodeInputRef.current?.click()}
										aria-label="Editar QR Code"
									>
										<img src={qrcodePreview || ong.qrcode} alt="" />
									</button>
									<input
										ref={qrcodeInputRef}
										id="qrcode-edicao-ong"
										className="input-arquivo-edicao-ong"
										type="file"
										accept="image/*"
										onChange={(evento) => selecionarImagem(evento, setQrcode, 'QR Code')}
									/>
									<button className="botao-lapis-qrcode-edicao-ong" type="button" onClick={() => qrcodeInputRef.current?.click()} aria-label="Editar QR Code">
										<img src="/images/lapisinho.png" alt="" />
									</button>
								</div>
							</div>
							<CampoEditavel id="pix-edicao-ong" label="Alterar Chave Pix" value={chavePix} onChange={setChavePix} />
						</div>

						{erro && <p className="mensagem-edicao-ong erro-edicao-ong" role="alert">{erro}</p>}
						<div className="acoes-form-edicao-ong">
							<button className="hover-botao-vermelho" type="submit" disabled={salvando}>
								{salvando ? 'Salvando...' : 'Salvar'}
							</button>
						</div>
					</form>
				)}
			</main>
		</div>
	);
}