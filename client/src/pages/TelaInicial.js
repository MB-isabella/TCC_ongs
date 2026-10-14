import { useState } from 'react';
import { Link } from 'react-router-dom';
import CarrosselOngs from '../components/CarrosselOngs';
import Footer from '../components/Footer';
import './TelaInicial.css';

export default function TelaInicial() {
	const [loginAberto, setLoginAberto] = useState(false);

	return (
		<>
			<main
				className="tela-inicial"
				style={{ backgroundImage: "url('/images/telainicialfundo.png')" }}
			>
			<nav className="navbar-inicial" aria-label="Navegação principal">
				<Link to="/" className="placeholder-icone" aria-label="Início">
					<img src="/images/logobranca.PNG" alt="" />
					<span>OngsTorres</span>
				</Link>
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
					<Link to="/catalogo" className="botao-catalogo hover-botao-vermelho sem-gradiente-uniforme">Descubra as organizações</Link>
				</div>

				<div className="carrossel">
					<CarrosselOngs rotulo="Carrossel de imagens" mostrarControles />
				</div>
			</section>
			</main>
			<Footer />
		</>
	);
}
