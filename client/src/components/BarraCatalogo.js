import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const IMAGEM_PERFIL_PADRAO = '/images/usuariobranco.png';

function IconeSair() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M10 17l5-5-5-5M15 12H3" />
			<path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
		</svg>
	);
}

export default function BarraCatalogo({
	imagemPerfil = '',
	destinoPerfil = '/login-usuario',
	rotuloPerfil = 'Entrar',
	aoAbrirPerfil,
	aoSair,
}) {
	const { pathname } = useLocation();
	const [imagemComErro, setImagemComErro] = useState(false);
	const paginaInicialAtiva = pathname === '/';
	const catalogoAtivo = pathname === '/catalogo' || pathname.startsWith('/perfil-ong/');
	const sobreAtivo = pathname === '/sobre';
	const perfilAtivo = [
		'/perfil-usuario',
		'/perfil-ong-proprietario',
		'/editar-perfil',
		'/editar-perfil-ong',
		'/verificar-doacoes-ong',
		'/deletar-conta',
		'/excluir-conta-ong',
		'/minhas-doacoes',
	].some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
	const origemImagemPerfil = imagemPerfil && !imagemComErro
		? imagemPerfil
		: IMAGEM_PERFIL_PADRAO;

	useEffect(() => {
		setImagemComErro(false);
	}, [imagemPerfil]);

	const conteudoPerfil = (
		<img
			className={origemImagemPerfil === IMAGEM_PERFIL_PADRAO
				? 'imagem-perfil-barra-catalogo'
				: 'foto-perfil-barra-catalogo'}
			src={origemImagemPerfil}
			alt=""
			onError={() => setImagemComErro(true)}
		/>
	);

	return (
		<>
			<aside className="barra-lateral-catalogo-compartilhada" aria-label="Navegação lateral">
				<nav className="icones-barra-catalogo-compartilhada">
					<Link
						to="/"
						className={`atalho-barra-catalogo-compartilhada atalho-inicio-barra-catalogo-compartilhada${paginaInicialAtiva ? ' ativo' : ''}`}
						aria-label="Voltar a tela inicial"
						aria-current={paginaInicialAtiva ? 'page' : undefined}
						data-tooltip="Voltar a tela inicial"
					>
						<img src="/images/casinha.png" alt="" />
					</Link>
					<Link
						to="/catalogo"
						className={`atalho-barra-catalogo-compartilhada${catalogoAtivo ? ' ativo' : ''}`}
						aria-label="Catálogo"
						aria-current={catalogoAtivo ? 'page' : undefined}
						data-tooltip="Catálogo"
					>
						<img src="/images/iconeong.png" alt="" />
					</Link>
					<Link
						to="/sobre"
						className={`atalho-barra-catalogo-compartilhada${sobreAtivo ? ' ativo' : ''}`}
						aria-label="Sobre"
						aria-current={sobreAtivo ? 'page' : undefined}
						data-tooltip="Sobre"
					>
						<img src="/images/informacao.png" alt="" />
					</Link>
					{aoAbrirPerfil ? (
						<button
							type="button"
							className={`atalho-barra-catalogo-compartilhada${perfilAtivo ? ' ativo' : ''}`}
							onClick={aoAbrirPerfil}
							aria-label="Perfil"
							data-tooltip="Perfil"
						>
							{conteudoPerfil}
						</button>
					) : (
						<Link
							to={destinoPerfil}
							className={`atalho-barra-catalogo-compartilhada${perfilAtivo ? ' ativo' : ''}`}
							aria-label={rotuloPerfil}
							aria-current={perfilAtivo ? 'page' : undefined}
							data-tooltip="Perfil"
						>
							{conteudoPerfil}
						</Link>
					)}
				</nav>

				{aoSair && (
					<button
						type="button"
						className="atalho-barra-catalogo-compartilhada sair-barra-catalogo-compartilhada"
						onClick={aoSair}
						aria-label="Encerrar sessão"
					>
						<IconeSair />
					</button>
				)}
			</aside>

			<header className="topbar-catalogo-compartilhada">
				<Link to="/" className="marca-catalogo-compartilhada" aria-label="UniLinorte - início">
					<span>UniLinorte</span>
					<img src="/images/logobranca.PNG" alt="" />
				</Link>
			</header>
		</>
	);
}
