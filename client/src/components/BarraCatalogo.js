import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BarraCatalogo.css';

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
	const [imagemComErro, setImagemComErro] = useState(false);
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
						className="atalho-barra-catalogo-compartilhada atalho-inicio-barra-catalogo-compartilhada"
						aria-label="Início"
					>
						<img src="/images/casinha.png" alt="" />
					</Link>
					<Link
						to="/sobre"
						className="atalho-barra-catalogo-compartilhada"
						aria-label="Sobre"
					>
						<img src="/images/informacao.png" alt="" />
					</Link>
					{aoAbrirPerfil ? (
						<button
							type="button"
							className="atalho-barra-catalogo-compartilhada"
							onClick={aoAbrirPerfil}
							aria-label="Perfil"
						>
							{conteudoPerfil}
						</button>
					) : (
						<Link
							to={destinoPerfil}
							className="atalho-barra-catalogo-compartilhada"
							aria-label={rotuloPerfil}
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
				<Link to="/" className="marca-catalogo-compartilhada" aria-label="OngsTorres - início">
					<span>OngsTorres</span>
					<img src="/images/logobranca.PNG" alt="" />
				</Link>
			</header>
		</>
	);
}
