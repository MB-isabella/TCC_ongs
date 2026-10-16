import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BarraCatalogo from '../components/BarraCatalogo';
import { editarUsuario, getDadosSessao, getPerfilUsuario } from '../services/catalogo';

const IMAGEM_PLACEHOLDER = '/images/perfilplaceholder.png';

export default function EdicaoUsuario() {
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const usuarioId = sessao?.id;
	const usuarioAutenticado = Boolean(usuarioId && sessao?.tipo === 'usuario');
	const imagemInputRef = useRef(null);
	const loginInputRef = useRef(null);
	const emailInputRef = useRef(null);
	const nomeInputRef = useRef(null);
	const [usuario, setUsuario] = useState(null);
	const [fotoPerfil, setFotoPerfil] = useState(sessao?.imagemPerfil || IMAGEM_PLACEHOLDER);
	const [imagem, setImagem] = useState(null);
	const [imagemPreview, setImagemPreview] = useState('');
	const [login, setLogin] = useState('');
	const [email, setEmail] = useState('');
	const [nome, setNome] = useState('');
	const [senha, setSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [carregandoPerfil, setCarregandoPerfil] = useState(true);
	const [salvando, setSalvando] = useState(false);
	const [mensagem, setMensagem] = useState('');
	const [erro, setErro] = useState('');

	useEffect(() => {
		if (!usuarioAutenticado) return undefined;

		const controller = new AbortController();
		getPerfilUsuario(usuarioId, controller.signal)
			.then((perfil) => {
				setUsuario(perfil);
				setLogin(perfil.login || '');
				setEmail(perfil.email || '');
				setNome(perfil.nome || '');
				setFotoPerfil(perfil.imagem_perfil || IMAGEM_PLACEHOLDER);
				if (perfil.imagem_perfil) localStorage.setItem('imagemPerfil', perfil.imagem_perfil);
			})
			.catch((erroRequisicao) => {
				if (erroRequisicao.name !== 'AbortError') setErro(erroRequisicao.message);
			})
			.finally(() => {
				if (!controller.signal.aborted) setCarregandoPerfil(false);
			});

		return () => controller.abort();
	}, [usuarioAutenticado, usuarioId]);

	useEffect(() => {
		if (!imagem) {
			setImagemPreview('');
			return undefined;
		}

		const urlPreview = URL.createObjectURL(imagem);
		setImagemPreview(urlPreview);
		return () => URL.revokeObjectURL(urlPreview);
	}, [imagem]);

	const encerrarSessao = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('tipoConta');
		localStorage.removeItem('imagemPerfil');
		navigate('/');
	};

	const salvarEdicao = async (evento) => {
		evento.preventDefault();
		setErro('');
		setMensagem('');

		if ((senha || confirmarSenha) && senha !== confirmarSenha) {
			setErro('As senhas não coincidem.');
			return;
		}

		setSalvando(true);
		const dados = new FormData();
		dados.append('login', login);
		dados.append('email', email);
		dados.append('nome', nome);
		if (senha) dados.append('senha', senha);
		if (imagem) dados.append('imagem', imagem);

		try {
			const retorno = await editarUsuario(usuarioId, dados);
			const usuarioAtualizado = retorno.usuario;
			if (usuarioAtualizado) {
				setUsuario(usuarioAtualizado);
				setLogin(usuarioAtualizado.login || login);
				setEmail(usuarioAtualizado.email || email);
				setNome(usuarioAtualizado.nome || nome);
				setFotoPerfil(usuarioAtualizado.imagem_perfil || IMAGEM_PLACEHOLDER);
				if (usuarioAtualizado.imagem_perfil) {
					localStorage.setItem('imagemPerfil', usuarioAtualizado.imagem_perfil);
				} else {
					localStorage.removeItem('imagemPerfil');
				}
			}
			setImagem(null);
			setSenha('');
			setConfirmarSenha('');
			if (imagemInputRef.current) imagemInputRef.current.value = '';
			setMensagem('Usuário atualizado com sucesso.');
			setTimeout(() => navigate('/perfil-usuario', { replace: true }), 1000);
		} catch (erroRequisicao) {
			setErro(erroRequisicao.message || 'Não foi possível salvar as alterações.');
		} finally {
			setSalvando(false);
		}
	};

	if (!usuarioAutenticado) {
		return <Navigate to="/login-usuario" replace state={{ from: { pathname: '/editar-perfil' } }} />;
	}

	const imagemExibida = imagemPreview || fotoPerfil;

	return (
		<div className="pagina-perfil-usuario pagina-edicao-usuario">
			<BarraCatalogo
				imagemPerfil={fotoPerfil === IMAGEM_PLACEHOLDER ? '' : fotoPerfil}
				destinoPerfil="/perfil-usuario"
				rotuloPerfil="Perfil"
				aoSair={encerrarSessao}
			/>

			<main className="conteudo-perfil-usuario conteudo-com-barra-catalogo">
				<section className="painel-perfil-usuario painel-edicao-usuario" aria-labelledby="titulo-edicao-usuario">
					<h1 id="titulo-edicao-usuario" className="sr-only-edicao-usuario">Editar perfil do usuário</h1>
					<div className="cabecalho-perfil-usuario cabecalho-edicao-usuario">
						<div className="grupo-foto-edicao-usuario">
							<div className="moldura-foto-perfil-usuario">
								<img
									className={imagemExibida === IMAGEM_PLACEHOLDER ? 'imagem-placeholder-perfil-usuario' : ''}
									src={imagemExibida || IMAGEM_PLACEHOLDER}
									alt="Foto de perfil do usuário"
									onError={() => setFotoPerfil(IMAGEM_PLACEHOLDER)}
								/>
							</div>
							<input
								ref={imagemInputRef}
								className="entrada-imagem-edicao-usuario"
								id="imagem-edicao-usuario"
								type="file"
								accept="image/*"
								onChange={(evento) => setImagem(evento.target.files?.[0] || null)}
							/>
							<button
								className="botao-lapis-foto-edicao-usuario"
								type="button"
								aria-label="Editar foto de perfil"
								onClick={() => imagemInputRef.current?.click()}
							>
								<img src="/images/lapisinho.png" alt="" />
							</button>
						</div>

						<div className="campo-login-edicao-usuario">
							<label className="sr-only-edicao-usuario" htmlFor="login-edicao-usuario">Nome de usuário</label>
							<input
								ref={loginInputRef}
								id="login-edicao-usuario"
								name="login"
								autoComplete="username"
								value={login}
								onChange={(evento) => setLogin(evento.target.value)}
								disabled={carregandoPerfil || salvando}
								required
							/>
							<button type="button" aria-label="Editar nome de usuário" onClick={() => loginInputRef.current?.focus()}>
								<img src="/images/lapisinho.png" alt="" />
							</button>
						</div>

						<button className="botao-cancelar-edicao-usuario hover-botao-vermelho" type="button" onClick={() => navigate('/perfil-usuario')}>
							Cancelar
						</button>
					</div>

					{carregandoPerfil && <p className="estado-edicao-usuario" role="status">Carregando perfil...</p>}
					{erro && <p className="mensagem-edicao-usuario erro-edicao-usuario" role="alert">{erro}</p>}
					{mensagem && <p className="mensagem-edicao-usuario" role="status">{mensagem}</p>}

					<form className="formulario-edicao-usuario" onSubmit={salvarEdicao}>
						<div className="linha-campo-edicao-usuario">
							<label htmlFor="email-edicao-usuario">E-mail:</label>
							<input
								ref={emailInputRef}
								id="email-edicao-usuario"
								name="email"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(evento) => setEmail(evento.target.value)}
								disabled={carregandoPerfil || salvando}
								required
							/>
							<button type="button" aria-label="Editar e-mail" onClick={() => emailInputRef.current?.focus()}>
								<img src="/images/lapisinho.png" alt="" />
							</button>
						</div>

						<div className="linha-campo-edicao-usuario">
							<label htmlFor="nome-edicao-usuario">Nome completo:</label>
							<input
								ref={nomeInputRef}
								id="nome-edicao-usuario"
								name="nome"
								autoComplete="name"
								value={nome}
								onChange={(evento) => setNome(evento.target.value)}
								disabled={carregandoPerfil || salvando}
								required
							/>
							<button type="button" aria-label="Editar nome completo" onClick={() => nomeInputRef.current?.focus()}>
								<img src="/images/lapisinho.png" alt="" />
							</button>
						</div>

						<div className="linha-senhas-edicao-usuario">
							<strong>Editar senha</strong>
							<label htmlFor="senha-edicao-usuario">Nova senha:</label>
							<input
								id="senha-edicao-usuario"
								name="senha"
								type="password"
								autoComplete="new-password"
								value={senha}
								onChange={(evento) => setSenha(evento.target.value)}
								disabled={carregandoPerfil || salvando}
							/>
							<label htmlFor="confirmar-senha-edicao-usuario">Confirmar nova senha:</label>
							<input
								id="confirmar-senha-edicao-usuario"
								name="confirmarSenha"
								type="password"
								autoComplete="new-password"
								value={confirmarSenha}
								onChange={(evento) => setConfirmarSenha(evento.target.value)}
								disabled={carregandoPerfil || salvando}
							/>
						</div>

						<div className="acoes-edicao-usuario">
							<button className="hover-botao-vermelho" type="submit" disabled={carregandoPerfil || salvando || !usuario}>
								{salvando ? 'Salvando...' : 'Salvar'}
							</button>
						</div>
					</form>
				</section>
			</main>
		</div>
	);
}
