import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { deletarOng, getDadosSessao } from '../services/catalogo';

export default function DeletarOng() {
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const ongId = sessao?.id;
	const ongAutenticada = Boolean(ongId && sessao?.tipo === 'ong');
	const [senha, setSenha] = useState('');
	const [erro, setErro] = useState('');
	const [sucesso, setSucesso] = useState(false);
	const [carregando, setCarregando] = useState(false);

	if (!ongAutenticada && !sucesso) {
		return <Navigate to="/login-ong" replace state={{ from: { pathname: '/excluir-conta-ong' } }} />;
	}

	const confirmarExclusao = async (evento) => {
		evento.preventDefault();
		setErro('');
		setCarregando(true);

		try {
			await deletarOng(ongId, senha);
			localStorage.removeItem('token');
			localStorage.removeItem('tipoConta');
			localStorage.removeItem('imagemPerfil');
			setSucesso(true);
			await new Promise((resolver) => setTimeout(resolver, 1000));
			navigate('/', { replace: true });
		} catch (erroRequisicao) {
			setErro(erroRequisicao.message || 'Não foi possível excluir a conta da ONG.');
		} finally {
			setCarregando(false);
		}
	};

	return (
		<main className="pagina-deletar-ong">
			<section className="cartao-deletar-ong" aria-labelledby="titulo-deletar-ong">
				<Link to="/" className="marca-deletar-ong" aria-label="Página inicial">
					<img src="/images/logovermelha.PNG" alt="" />
				</Link>
				<h1 id="titulo-deletar-ong">Deseja realmente<br />excluir sua conta?</h1>
				<p className="instrucao-deletar-ong">
					Digite sua senha abaixo para<br />
					que possa ser efetuada a<br />
					exclusão da sua conta
				</p>

				{sucesso ? (
					<p className="sucesso-deletar-ong" role="status">ONG deletada com sucesso</p>
				) : (
				<form onSubmit={confirmarExclusao}>
					<label htmlFor="senha-deletar-ong">Senha</label>
					<input
						id="senha-deletar-ong"
						type="password"
						autoComplete="current-password"
						value={senha}
						onChange={(evento) => setSenha(evento.target.value)}
						required
						disabled={carregando}
					/>
					{erro && <p className="erro-deletar-ong" role="alert">{erro}</p>}
					<div className="acoes-deletar-ong">
						<button type="submit" className="confirmar-deletar-ong hover-botao-vermelho sem-gradiente-uniforme" disabled={carregando}>
							{carregando ? 'Excluindo...' : 'Excluir'}
						</button>
						<Link to="/perfil-ong-proprietario" className="cancelar-deletar-ong">Cancelar</Link>
					</div>
				</form>
				)}
			</section>
		</main>
	);
}