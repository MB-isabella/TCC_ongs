import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getDadosSessao } from '../services/catalogo';

export default function LoginUsuario() {
	const navigate = useNavigate();
	const location = useLocation();
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [mensagem, setMensagem] = useState('');
	const [carregando, setCarregando] = useState(false);
	const sessao = getDadosSessao();

	const realizarLogin = async (evento) => {
		evento.preventDefault();
		setMensagem('');
		setCarregando(true);

		try {
			const resposta = await fetch('http://localhost:7777/usuario/login-usuario', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, senha }),
			});
			const dados = await resposta.json();

			if (!resposta.ok) {
				throw new Error(dados.mensagem || 'Não foi possível realizar o login');
			}

			if (!dados.token) {
				throw new Error('Token de autenticação não recebido');
			}

			localStorage.setItem('token', dados.token);
			localStorage.setItem('tipoConta', 'usuario');
			if (dados.imagem_perfil) {
				localStorage.setItem('imagemPerfil', dados.imagem_perfil);
			} else {
				localStorage.removeItem('imagemPerfil');
			}
			const destino = location.state?.from;
			const voltarParaDoacao = typeof destino?.pathname === 'string'
				&& destino.pathname.startsWith('/doacao/');
			navigate(
				voltarParaDoacao ? `${destino.pathname}${destino.search || ''}` : '/catalogo',
				{ replace: true }
			);
		} catch (erro) {
			setMensagem(erro.message || 'Erro ao conectar com o servidor');
		} finally {
			setCarregando(false);
		}
	};

	if (sessao) {
		return <Navigate to={sessao.tipo === 'ong' ? '/perfil-ong-proprietario' : '/catalogo'} replace />;
	}

	return (
		<main className="pagina-login-usuario">
			<section className="painel-login-usuario">
				<div className="lado-formulario-login">
					<Link to="/" className="logo-login" aria-label="Voltar para o início">
						<img src="/images/logovermelha.PNG" alt="" />
					</Link>
					<div className="cabecalho-login">
						<p>Bem-vindo de volta!</p>
						<h1>Login do usuário</h1>
					</div>

					<form className="formulario-login" onSubmit={realizarLogin}>
						<label htmlFor="email">E-mail</label>
						<div className="campo-login campo-email">
							<span aria-hidden="true">@</span>
							<input id="email" type="email" value={email} onChange={(evento) => setEmail(evento.target.value)} required />
						</div>
						<label htmlFor="senha">Senha</label>
						<div className="campo-login campo-senha">
							<img className="icone-cadeado" src="/images/cadeado.png" alt="" />
							<input id="senha" type="password" value={senha} onChange={(evento) => setSenha(evento.target.value)} required />
						</div>
						<Link to="/recuperacao-senha?tipo=usuario" className="recuperar-senha">Esqueci minha senha</Link>
						{mensagem && <p className="mensagem-login" role="alert">{mensagem}</p>}
						<button type="submit" className="botao-entrar hover-botao-vermelho" disabled={carregando}>
							<span>{carregando ? 'Entrando...' : 'Entrar'}</span>
							<span aria-hidden="true">➜</span>
						</button>
					</form>
				</div>

				<div className="lado-cadastro-login" style={{ backgroundImage: "url('/images/telainicialfundo.png')", backgroundPosition: 'right center' }}>
					<Link to="/" className="voltar-inicio">Voltar para o início</Link>
					<div className="chamada-cadastro">
						<p>Não possui uma conta?</p>
						<h2>Cadastre-se<br />agora!</h2>
						<div className="botoes-cadastro">
							<Link to="/cadastro-usuario" className="botao-cadastro hover-botao-vermelho">
								<img src="/images/cadastrousuario.png" alt="" />
								<span>Cadastrar usuário</span>
							</Link>
							<Link to="/cadastro-ong" className="botao-cadastro hover-botao-vermelho">
								<img src="/images/iconeong.png" alt="" />
								<span>Cadastrar ONG</span>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
