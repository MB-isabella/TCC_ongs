import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import BarraCatalogo from '../components/BarraCatalogo';
import { getDadosSessao, getPerfilUsuario } from '../services/catalogo';

const IMAGEM_PLACEHOLDER = '/images/perfilplaceholder.png';

export default function PerfilUsuario() {
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const usuarioId = sessao?.id;
	const usuarioTipo = sessao?.tipo;
	const usuarioAutenticado = Boolean(usuarioId && usuarioTipo === 'usuario');
	const [usuario, setUsuario] = useState(null);
	const [fotoPerfil, setFotoPerfil] = useState(sessao?.imagemPerfil || IMAGEM_PLACEHOLDER);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState('');

	useEffect(() => {
		if (!usuarioAutenticado) return undefined;

		const controller = new AbortController();
		getPerfilUsuario(usuarioId, controller.signal)
			.then((perfil) => {
				setUsuario(perfil);
				setFotoPerfil(perfil.imagem_perfil || IMAGEM_PLACEHOLDER);
				if (perfil.imagem_perfil) localStorage.setItem('imagemPerfil', perfil.imagem_perfil);
			})
			.catch((erroRequisicao) => {
				if (erroRequisicao.name !== 'AbortError') setErro(erroRequisicao.message);
			})
			.finally(() => {
				if (!controller.signal.aborted) setCarregando(false);
			});

		return () => controller.abort();
	}, [usuarioAutenticado, usuarioId]);

	const encerrarSessao = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('tipoConta');
		localStorage.removeItem('imagemPerfil');
		navigate('/');
	};

	if (!usuarioAutenticado) {
		return <Navigate to="/login-usuario" replace state={{ from: { pathname: '/perfil-usuario' } }} />;
	}

	return (
		<div className="pagina-perfil-usuario">
			<BarraCatalogo
				imagemPerfil={fotoPerfil === IMAGEM_PLACEHOLDER ? '' : fotoPerfil}
				destinoPerfil="/perfil-usuario"
				rotuloPerfil="Perfil"
				aoSair={encerrarSessao}
			/>

			<main className="conteudo-perfil-usuario conteudo-com-barra-catalogo">
				<section className="painel-perfil-usuario" aria-labelledby="login-perfil-usuario">
					<Link to="/catalogo" className="voltar-catalogo-perfil-usuario">
						<span aria-hidden="true">‹</span>
						Voltar
					</Link>

					<div className="cabecalho-perfil-usuario">
						<div className="moldura-foto-perfil-usuario">
							<img
								className={fotoPerfil === IMAGEM_PLACEHOLDER ? 'imagem-placeholder-perfil-usuario' : ''}
								src={fotoPerfil}
								alt="Foto de perfil do usuário"
								onError={() => setFotoPerfil(IMAGEM_PLACEHOLDER)}
							/>
						</div>
						<div className="cartao-login-perfil-usuario">
							{carregando ? (
								<p role="status">Carregando perfil...</p>
							) : (
								<h1 id="login-perfil-usuario">{usuario?.login}</h1>
							)}
						</div>
					</div>

					{erro && <p className="erro-perfil-usuario" role="alert">{erro}</p>}

					{usuario && (
						<>
							<div className="informacao-perfil-usuario">
								<strong>E-mail:</strong>
								<span>{usuario.email}</span>
							</div>
							<div className="informacao-perfil-usuario">
								<strong>Nome completo:</strong>
								<span>{usuario.nome}</span>
							</div>

							<nav className="atalhos-perfil-usuario" aria-label="Opções do perfil">
								<Link to="/editar-perfil" className="item-atalho-perfil-usuario">
									<span>Editar meu perfil</span>
									<img src="/images/lapisinho.png" alt="" />
								</Link>
								<Link to="/minhas-doacoes" className="item-atalho-perfil-usuario">
									<span>Minhas doações</span>
									<img src="/images/doacao.png" alt="" />
								</Link>
							</nav>
						</>
					)}

					<div className="acoes-conta-perfil-usuario">
						<Link to="/deletar-conta" className="botao-excluir-conta-perfil-usuario hover-botao-vermelho sem-gradiente-uniforme">
							EXCLUIR CONTA
						</Link>
					</div>
				</section>
			</main>
		</div>
	);
}