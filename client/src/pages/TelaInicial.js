import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import './TelaInicial.css';

const slides = [1, 2, 3];

export default function TelaInicial() {
	const [slideAtual, setSlideAtual] = useState(0);
	const [loginAberto, setLoginAberto] = useState(false);

	useEffect(() => {
		const intervalo = setInterval(() => {
			setSlideAtual((slide) => (slide + 1) % slides.length);
		}, 4500);

		return () => clearInterval(intervalo);
	}, []);

	const trocarSlide = (direcao) => {
		setSlideAtual((slide) => (slide + direcao + slides.length) % slides.length);
	};

	return (
		<>
			<main
				className="tela-inicial"
				style={{ backgroundImage: "url('/images/telainicialfundo.png')" }}
			>
			<nav className="navbar-inicial" aria-label="Navegação principal">
				<Link to="/" className="placeholder-icone" aria-label="Início">♡</Link>
				<div className="links-navbar">
					<Link to="/" className="link-navbar">Início</Link>
					<Link to="/cadastro-usuario" className="link-navbar">Cadastrar</Link>
					<a href="/cadastro-ong" className="link-navbar">Cadastrar ONG</a>
					<div className="login-navbar">
						<button type="button" className="link-navbar botao-login" onClick={() => setLoginAberto((aberto) => !aberto)}>Login</button>
						{loginAberto && (
							<div className="modal-login" role="dialog" aria-modal="true" aria-labelledby="titulo-login">
								<div className="conteudo-modal-login">
									<h2 id="titulo-login">Qual tipo de login<br />deseja realizar?</h2>
									<div className="opcoes-login">
										<Link to="/login-usuario" className="opcao-login">
											<img className="icone-login" src="/images/usuariovermelho.png" alt="" />
											<span>Usuário</span>
										</Link>
										<Link to="/login-ong" className="opcao-login">
											<img className="icone-login" src="/images/prediovermelho.png" alt="" />
											<span>ONG</span>
										</Link>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</nav>

			<section className="hero-inicial">
				<div className="texto-hero">
					<h1>Conheça as<br />ONGS locais!</h1>
					<p>Encontre organizações próximas a você e faça a diferença.</p>
					<Link to="/catalogo" className="botao-catalogo">Descubra as organizações</Link>
				</div>

				<div className="carrossel" aria-label="Carrossel de fotos">
					<div className={`placeholder-foto foto-${slideAtual + 1}`} aria-label={`Placeholder da foto ${slideAtual + 1}`} role="img" />
					<button type="button" className="seta seta-esquerda" onClick={() => trocarSlide(-1)} aria-label="Foto anterior">‹</button>
					<button type="button" className="seta seta-direita" onClick={() => trocarSlide(1)} aria-label="Próxima foto">›</button>
					<div className="indicadores">
						{slides.map((slide, indice) => (
							<button
								type="button"
								key={slide}
								className={indice === slideAtual ? 'indicador ativo' : 'indicador'}
								onClick={() => setSlideAtual(indice)}
								aria-label={`Selecionar foto ${indice + 1}`}
								aria-current={indice === slideAtual ? 'true' : undefined}
							/>
						))}
					</div>
				</div>
			</section>
			</main>
			<Footer />
		</>
	);
}
