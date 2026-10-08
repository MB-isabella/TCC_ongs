import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import './CadastrarUsuario.css';

export default function CadastrarUsuario() {
	const navigate = useNavigate();
	const [nome, setNome] = useState('');
	const [login, setLogin] = useState('');
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [imagem, setImagem] = useState(null);
	const [imagemPreview, setImagemPreview] = useState('');
	const [mensagem, setMensagem] = useState('');
	const [carregando, setCarregando] = useState(false);

	useEffect(() => {
		if (!imagem) {
			setImagemPreview('');
			return undefined;
		}

		const urlPreview = URL.createObjectURL(imagem);
		setImagemPreview(urlPreview);
		return () => URL.revokeObjectURL(urlPreview);
	}, [imagem]);

	const enviarCadastro = async (evento) => {
		evento.preventDefault();
		setMensagem('');
		setCarregando(true);

		const dados = new FormData();
		dados.append('nome', nome);
		dados.append('login', login);
		dados.append('email', email);
		dados.append('senha', senha);
		if (imagem) dados.append('imagem', imagem);

		try {
			const resposta = await fetch('http://localhost:7777/usuario/registrar-usuario', {
				method: 'POST',
				body: dados,
			});
			const retorno = await resposta.json();

			if (!resposta.ok) {
				throw new Error(retorno.mensagem || 'Não foi possível cadastrar o usuário');
			}

			setMensagem('Cadastro realizado com sucesso.');
			setTimeout(() => navigate('/login-usuario'), 1200);
		} catch (erro) {
			setMensagem(erro.message || 'Erro ao conectar com o servidor');
		} finally {
			setCarregando(false);
		}
	};

	return (
		<main className="pagina-cadastro-usuario">
			<aside
				className="lateral-cadastro-usuario"
				style={{ backgroundImage: "linear-gradient(90deg, rgba(67, 0, 5, .18), rgba(67, 0, 5, .06)), url('/images/telainicialfundo.png')" }}
			>
				<div className="topo-lateral-cadastro">
					<Link to="/" className="voltar-cadastro">Voltar para o início</Link>
					<Link to="/" className="marca-cadastro" aria-label="Página inicial">♡</Link>
				</div>
				<div className="chamada-lateral-cadastro">
					<p>Já tem uma conta?</p>
					<h2>Bem-vindo de<br />volta!</h2>
					<Link to="/login-usuario" className="botao-login-cadastro">Entrar</Link>
				</div>
			</aside>

			<section className="conteudo-cadastro-usuario">
				<div className="cabecalho-cadastro-usuario">
					<Link to="/cadastro-ong" className="link-cadastro-ong">Deseja cadastrar uma ONG?</Link>
					<h1>Cadastro de usuário</h1>
				</div>

				<form className="formulario-cadastro-usuario" onSubmit={enviarCadastro}>
					<label htmlFor="nome-cadastro">Nome completo</label>
					<input id="nome-cadastro" name="nome" autoComplete="name" value={nome} onChange={(evento) => setNome(evento.target.value)} required />

					<label htmlFor="login-cadastro">Nome de usuário</label>
					<input id="login-cadastro" name="login" autoComplete="username" value={login} onChange={(evento) => setLogin(evento.target.value)} required />

					<label htmlFor="email-cadastro">E-mail</label>
					<input id="email-cadastro" name="email" type="email" autoComplete="email" value={email} onChange={(evento) => setEmail(evento.target.value)} required />

					<label htmlFor="senha-cadastro">Senha</label>
					<input id="senha-cadastro" name="senha" type="password" autoComplete="new-password" value={senha} onChange={(evento) => setSenha(evento.target.value)} required />

					<label className="rotulo-foto-cadastro" htmlFor="imagem-cadastro">Foto de perfil</label>
					<input id="imagem-cadastro" className="entrada-arquivo-cadastro" type="file" accept="image/*" onChange={(evento) => setImagem(evento.target.files?.[0] || null)} />
					<label className={`seletor-foto-cadastro${imagem ? ' tem-imagem' : ''}`} htmlFor="imagem-cadastro">
						{imagem ? <img src={imagemPreview} alt="Prévia da foto de perfil" /> : <img className="icone-imagem-cadastro" src="/images/imagemicone.png" alt="" />}
						<span className="texto-selecao-foto">{imagem ? imagem.name : 'Escolher imagem'}</span>
					</label>

					{mensagem && <p className="mensagem-cadastro-usuario" role="status">{mensagem}</p>}
					<button className="botao-enviar-cadastro" type="submit" disabled={carregando}>
						{carregando ? 'Enviando...' : 'cadastrar'}
					</button>
				</form>
			</section>
		</main>
	);
}
