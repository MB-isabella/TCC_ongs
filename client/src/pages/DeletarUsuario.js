import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { deletarUsuario, getDadosSessao } from '../services/catalogo';
import './DeletarUsuario.css';

export default function DeletarUsuario() {
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const usuarioId = sessao?.id;
	const usuarioAutenticado = Boolean(usuarioId && sessao?.tipo === 'usuario');
	const [senha, setSenha] = useState('');
	const [erro, setErro] = useState('');
	const [sucesso, setSucesso] = useState(false);
	const [carregando, setCarregando] = useState(false);

	if (!usuarioAutenticado && !sucesso) {
		return <Navigate to="/login-usuario" replace state={{ from: { pathname: '/deletar-conta' } }} />;
	}

	const confirmarExclusao = async (evento) => {
		evento.preventDefault();
		setErro('');
		setCarregando(true);

		try {
			await deletarUsuario(usuarioId, senha);
			localStorage.removeItem('token');
			localStorage.removeItem('tipoConta');
			localStorage.removeItem('imagemPerfil');
			setSucesso(true);
			await new Promise((resolver) => setTimeout(resolver, 1000));
			navigate('/', { replace: true });
		} catch (erroRequisicao) {
			setErro(erroRequisicao.message || 'Não foi possível excluir a conta.');
		} finally {
			setCarregando(false);
		}
	};

	return (
		<main className="pagina-deletar-usuario">
			<section className="cartao-deletar-usuario" aria-labelledby="titulo-deletar-usuario">
				<Link to="/" className="marca-deletar-usuario" aria-label="Página inicial">
					<img src="/images/logovermelha.PNG" alt="" />
				</Link>
				<h1 id="titulo-deletar-usuario">Deseja realmente<br />excluir sua conta?</h1>
				<p className="instrucao-deletar-usuario">
					Digite sua senha abaixo para<br />
					que possa ser efetuada a<br />
					exclusão da sua conta
				</p>

				{sucesso ? (
					<p className="sucesso-deletar-usuario" role="status">Usuário deletado com sucesso</p>
				) : (
				<form onSubmit={confirmarExclusao}>
					<label htmlFor="senha-deletar-usuario">Senha</label>
					<input
						id="senha-deletar-usuario"
						type="password"
						autoComplete="current-password"
						value={senha}
						onChange={(evento) => setSenha(evento.target.value)}
						required
						disabled={carregando}
					/>
					{erro && <p className="erro-deletar-usuario" role="alert">{erro}</p>}
					<div className="acoes-deletar-usuario">
						<button type="submit" className="confirmar-deletar-usuario hover-botao-vermelho sem-gradiente-uniforme" disabled={carregando}>
							{carregando ? 'Excluindo...' : 'Excluir'}
						</button>
						<Link to="/perfil-usuario" className="cancelar-deletar-usuario">Cancelar</Link>
					</div>
				</form>
				)}
			</section>
		</main>
	);
}