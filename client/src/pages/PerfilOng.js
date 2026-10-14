import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BarraCatalogo from '../components/BarraCatalogo';
import CarrosselOngs from '../components/CarrosselOngs';
import Footer from '../components/Footer';
import { getDadosSessao, getPerfilOng, getPerfilUsuario } from '../services/catalogo';
import './PerfilOng.css';

export default function PerfilOng() {
	const { id } = useParams();
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const [ong, setOng] = useState(null);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState('');
	const [fotoPerfil, setFotoPerfil] = useState(sessao?.imagemPerfil || '');
	const sessaoId = sessao?.id;
	const sessaoTipo = sessao?.tipo;
	const imagemPerfilSessao = sessao?.imagemPerfil;

	useEffect(() => {
		const controller = new AbortController();

		getPerfilOng(id, controller.signal)
			.then(setOng)
			.catch((erroRequisicao) => {
				if (erroRequisicao.name !== 'AbortError') setErro(erroRequisicao.message);
			})
			.finally(() => {
				if (!controller.signal.aborted) setCarregando(false);
			});

		return () => controller.abort();
	}, [id]);

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
		<div className="pagina-perfil-ong">
			<BarraCatalogo
				imagemPerfil={fotoPerfil}
				destinoPerfil="/login-usuario"
				aoAbrirPerfil={sessao ? abrirPerfil : undefined}
				aoSair={sessao ? encerrarSessao : undefined}
			/>

			<main className="conteudo-pagina-perfil-ong conteudo-com-barra-catalogo">
				{carregando && <p className="status-perfil-ong" role="status">Carregando perfil da ONG...</p>}
				{erro && <p className="status-perfil-ong erro-perfil-ong" role="alert">{erro}</p>}
				{ong && (
					<>
						<section className="painel-perfil-ong" aria-labelledby="nome-perfil-ong">
							<Link to="/catalogo" className="voltar-catalogo-perfil-ong">
								<span aria-hidden="true">‹</span>
								Voltar
							</Link>
							<div className="banner-perfil-ong">
								{ong.banner && <img src={ong.banner} alt={`Banner da ONG ${ong.nome}`} />}
							</div>

							<div className="identidade-perfil-ong">
								{ong.logo && <img className="logo-perfil-ong" src={ong.logo} alt={`Logo da ONG ${ong.nome}`} />}
								<div className="identidade-texto-perfil-ong">
									<h1 id="nome-perfil-ong">{ong.nome}</h1>
									<div className="instagram-perfil-ong">
										<img src="/images/instagram.png" alt="" />
										<span>{ong.instagram?.trim() || 'ONG não possui instagram'}</span>
									</div>
								</div>
							</div>

							<dl className="dados-perfil-ong">
								<div><dt>E-mail</dt><dd>{ong.email}</dd></div>
								<div><dt>CNPJ</dt><dd>{ong.cnpj}</dd></div>
								<div><dt>Região</dt><dd>{ong.cidade_regiao}</dd></div>
							</dl>

							<div className="detalhes-perfil-ong">
								<section className="sobre-perfil-ong" aria-labelledby="titulo-sobre-ong">
									<h2 id="titulo-sobre-ong">
										<img src="/images/infoong.png" alt="" />
										<span>Sobre nós</span>
									</h2>
									<p>{ong.descricao || 'A ONG ainda não adicionou uma descrição.'}</p>
								</section>

								<section className="galeria-perfil-ong" aria-label={`Imagens de ${ong.nome}`}>
									<CarrosselOngs
										rotulo={`Carrossel de imagens da ONG ${ong.nome}`}
										mostrarControles
										imagens={ong.carrossel}
									/>
								</section>
							</div>

							<div className="chamada-doacao-perfil-ong">
								<p>Clique aqui para contribuir</p>
								<Link className="botao-doacao-perfil-ong hover-botao-vermelho" to={`/doacao/${encodeURIComponent(ong.id)}`}>Doe agora</Link>
							</div>
						</section>
						<Footer />
					</>
				)}
			</main>
		</div>
	);
}