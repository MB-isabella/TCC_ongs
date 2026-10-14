import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BarraCatalogo from '../components/BarraCatalogo';
import CarrosselOngs from '../components/CarrosselOngs';
import Footer from '../components/Footer';
import { buscarOngs, getDadosSessao, getOngs, getPerfilOng, getPerfilUsuario } from '../services/catalogo';
import './Catalogo.css';

function Icone({ nome, tamanho = 20, preenchido = false }) {
	const caminhos = {
		sair: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
		grupo: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2.5 20v-1.5a6.5 6.5 0 0 1 13 0V20zM16 14a5 5 0 0 1 5.5 5v1H17" /></>,
		busca: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
		filtro: <><path d="M3 5h18l-7 8v5l-4 2v-7z" /></>,
		seta: <><path d="M4 12h15m-6-6 6 6-6 6" /></>,
	};

	return (
		<svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill={preenchido ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			{caminhos[nome]}
		</svg>
	);
}

export default function Catalogo() {
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const [ongs, setOngs] = useState([]);
	const [ongsCarrossel, setOngsCarrossel] = useState([]);
	const [termo, setTermo] = useState('');
	const [carregando, setCarregando] = useState(true);
	const [buscando, setBuscando] = useState(false);
	const [erro, setErro] = useState('');
	const [erroBusca, setErroBusca] = useState('');
	const [fotoPerfil, setFotoPerfil] = useState(sessao?.imagemPerfil || '');
	const [filtroAberto, setFiltroAberto] = useState(false);
	const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

	useEffect(() => {
		const controller = new AbortController();

		getOngs(controller.signal)
			.then((dados) => {
				setOngs(dados);
				setOngsCarrossel(dados);
			})
			.catch((erroRequisicao) => {
				if (erroRequisicao.name !== 'AbortError') setErro(erroRequisicao.message);
			})
			.finally(() => {
				if (!controller.signal.aborted) setCarregando(false);
			});

		return () => controller.abort();
	}, []);

	useEffect(() => {
		const consulta = termo.trim();
		if (!consulta) {
			setOngs(ongsCarrossel);
			setErroBusca('');
			setBuscando(false);
			return undefined;
		}

		const controller = new AbortController();
		const temporizador = setTimeout(() => {
			setBuscando(true);
			setErroBusca('');
			buscarOngs(consulta, controller.signal)
				.then(setOngs)
				.catch((erroRequisicao) => {
					if (erroRequisicao.name !== 'AbortError') setErroBusca(erroRequisicao.message);
				})
				.finally(() => {
					if (!controller.signal.aborted) setBuscando(false);
				});
		}, 250);

		return () => {
			clearTimeout(temporizador);
			controller.abort();
		};
	}, [termo, ongsCarrossel]);

	const sessaoId = sessao?.id;
	const sessaoTipo = sessao?.tipo;
	const imagemPerfilSessao = sessao?.imagemPerfil;
	useEffect(() => {
		if (!sessaoId || imagemPerfilSessao) return undefined;
		const controller = new AbortController();
		const requisicaoPerfil = sessaoTipo === 'ong'
			? getPerfilOng(sessaoId, controller.signal).then((perfil) => perfil.logo)
			: getPerfilUsuario(sessaoId, controller.signal).then((perfil) => perfil.imagem_perfil);

		requisicaoPerfil
			.then((imagem) => {
				if (!imagem) return;
				setFotoPerfil(imagem);
				if (sessaoTipo === 'usuario') localStorage.setItem('imagemPerfil', imagem);
			})
			.catch((erroRequisicao) => {
				if (erroRequisicao.name !== 'AbortError') {
					console.error('Não foi possível carregar a imagem de perfil:', erroRequisicao);
				}
			});

		return () => controller.abort();
	}, [sessaoId, sessaoTipo, imagemPerfilSessao]);

	const categoriasDisponiveis = [...new Set(
		ongsCarrossel.flatMap((ong) => Array.isArray(ong.categoria) ? ong.categoria : [ong.categoria])
			.filter((categoria) => typeof categoria === 'string' && categoria.trim())
			.map((categoria) => categoria.trim())
	)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
	const ongsFiltradas = categoriaSelecionada
		? ongs.filter((ong) => {
			const categorias = Array.isArray(ong.categoria) ? ong.categoria : [ong.categoria];
			return categorias.some((categoria) => (
				typeof categoria === 'string'
				&& categoria.trim().toLocaleLowerCase('pt-BR') === categoriaSelecionada.toLocaleLowerCase('pt-BR')
			));
		})
		: ongs;

	const abrirPerfil = () => {
		if (!sessao) {
			navigate('/login-usuario');
			return;
		}
		navigate(sessao.tipo === 'ong' ? '/perfil-ong-proprietario' : '/perfil-usuario');
	};

	const encerrarSessao = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('tipoConta');
		localStorage.removeItem('imagemPerfil');
		navigate('/');
	};

	return (
		<div className="pagina-catalogo">
			<BarraCatalogo
				imagemPerfil={fotoPerfil}
				destinoPerfil="/login-usuario"
				aoAbrirPerfil={sessao ? abrirPerfil : undefined}
				aoSair={sessao ? encerrarSessao : undefined}
			/>

			<main className="conteudo-catalogo conteudo-com-barra-catalogo">
				<section className="painel-catalogo">
					<div className="apresentacao-catalogo">
						<CarrosselOngs rotulo="Carrossel de imagens" />
						<div className="texto-apresentacao-catalogo">
							<h1>Bem-vindo ao<br />OngsTorres</h1>
							<p>Conheça aqui as ONGs próximas</p>
						</div>
					</div>

					<section className="secao-ongs" aria-labelledby="titulo-ongs">
						<div className="cabecalho-ongs">
							<h2 id="titulo-ongs"><Icone nome="grupo" tamanho={19} /> ONGs</h2>
							<div className="acoes-catalogo">
								<label className="campo-pesquisa-catalogo">
									<Icone nome="busca" tamanho={18} />
									<input
										type="search"
										value={termo}
										onChange={(evento) => setTermo(evento.target.value)}
										placeholder="Pesquisar ONG"
										aria-label="Pesquisar ONG por nome ou categoria"
									/>
								</label>
								<div className="controle-filtro">
									<button
										type="button"
										className="botao-filtro-catalogo"
										aria-expanded={filtroAberto}
										aria-controls="opcoes-filtro-categoria"
										onClick={() => setFiltroAberto((aberto) => !aberto)}
									>
										<Icone nome="filtro" tamanho={15} preenchido={filtroAberto} /><span>Filtrar</span>
									</button>
									{filtroAberto && (
										<div className="opcoes-filtro-categoria" id="opcoes-filtro-categoria" aria-label="Filtrar ONGs por categoria">
											<p>Filtrar por categoria</p>
											<button
												type="button"
												className={!categoriaSelecionada ? 'opcao-categoria-filtro selecionada' : 'opcao-categoria-filtro'}
												aria-pressed={!categoriaSelecionada}
												onClick={() => setCategoriaSelecionada('')}
											>
												Todas as categorias
											</button>
											{categoriasDisponiveis.map((categoria) => (
												<button
													type="button"
													key={categoria}
													className={categoriaSelecionada === categoria ? 'opcao-categoria-filtro selecionada' : 'opcao-categoria-filtro'}
													aria-pressed={categoriaSelecionada === categoria}
													onClick={() => setCategoriaSelecionada((atual) => atual === categoria ? '' : categoria)}
												>
													{categoria}
												</button>
											))}
											{categoriasDisponiveis.length === 0 && (
												<span className="sem-categorias-filtro">Nenhuma categoria disponível.</span>
											)}
										</div>
									)}
								</div>
							</div>
						</div>

						{erro && <p className="mensagem-catalogo mensagem-erro" role="alert">{erro}</p>}
						{erroBusca && <p className="mensagem-catalogo mensagem-erro" role="alert">{erroBusca}</p>}
						{(carregando || buscando) && <p className="mensagem-catalogo" role="status">Carregando ONGs...</p>}
						{!carregando && !buscando && !erro && !erroBusca && ongsFiltradas.length === 0 && (
							<p className="mensagem-catalogo" role="status">
								{categoriaSelecionada ? `Nenhuma ONG encontrada na categoria ${categoriaSelecionada}.` : 'Nenhuma ONG encontrada.'}
							</p>
						)}

						<div className="grade-ongs">
							{ongsFiltradas.map((ong) => (
								<article className="card-ong" key={ong.id}>
									<Link to={`/perfil-ong/${ong.id}`} className="link-card-ong" aria-label={`Ver perfil da ONG ${ong.nome}`}>
										<div className="banner-card-ong">
											{ong.banner && <img src={ong.banner} alt="" />}
											{ong.logo && <img className="logo-card-ong" src={ong.logo} alt="" />}
										</div>
										<h3>{ong.nome}</h3>
										<p>{Array.isArray(ong.categoria) ? ong.categoria.join(', ') : ong.categoria}</p>
										<span className="seta-card-ong"><Icone nome="seta" tamanho={15} /></span>
									</Link>
								</article>
							))}
						</div>
					</section>
				</section>
				<Footer />
			</main>
		</div>
	);
}
