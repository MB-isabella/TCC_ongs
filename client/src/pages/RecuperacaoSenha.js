import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../styles/RecuperacaoSenha.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7777';

export default function RecuperacaoSenha() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token');
	const tipo = searchParams.get('tipo') === 'ong' ? 'ong' : 'usuario';
	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [mensagem, setMensagem] = useState('');
	const [erro, setErro] = useState(false);
	const [concluido, setConcluido] = useState(false);
	const [carregando, setCarregando] = useState(false);
	const redefinindo = Boolean(token);

	const enviarFormulario = async (evento) => {
		evento.preventDefault();
		setMensagem('');
		setErro(false);

		if (redefinindo && senha !== confirmarSenha) {
			setMensagem('As senhas não coincidem.');
			setErro(true);
			return;
		}

		setCarregando(true);
		try {
			const resposta = await fetch(
				`${API_URL}/usuario/${redefinindo ? 'redefinir-senha' : 'solicitar-recuperacao-senha'}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(redefinindo ? { token, senha, tipo } : { email, tipo }),
				}
			);
			const dados = await resposta.json();

			if (!resposta.ok) {
				throw new Error(dados.mensagem || 'Não foi possível processar sua solicitação.');
			}

			setMensagem(dados.mensagem);
			if (redefinindo) setConcluido(true);
		} catch (erroEnvio) {
			setMensagem(erroEnvio.message || 'Erro ao conectar com o servidor.');
			setErro(true);
		} finally {
			setCarregando(false);
		}
	};

	return (
		<main className="pagina-recuperacao-senha">
			<section className="cartao-recuperacao-senha" aria-labelledby="titulo-recuperacao-senha">
				<img className="icone-recuperacao-senha" src="/images/logovermelha.PNG" alt="" />
				<h1 id="titulo-recuperacao-senha">
					{redefinindo ? 'Redefinir senha' : 'Recuperação de senha'}
				</h1>
				<p className="instrucao-recuperacao-senha">
					{redefinindo
						? 'Crie uma nova senha com pelo menos 8 caracteres.'
						: 'Digite seu e-mail para receber um link de redefinição de senha.'}
				</p>

				{!concluido && (
					<form className="form-recuperacao-senha" onSubmit={enviarFormulario}>
						{redefinindo ? (
							<>
								<label htmlFor="senha-recuperacao">Nova senha</label>
								<input
									id="senha-recuperacao"
									name="senha"
									type="password"
									autoComplete="new-password"
									minLength="8"
									value={senha}
									onChange={(evento) => setSenha(evento.target.value)}
									required
								/>
								<label htmlFor="confirmar-senha-recuperacao">Confirmar nova senha</label>
								<input
									id="confirmar-senha-recuperacao"
									name="confirmarSenha"
									type="password"
									autoComplete="new-password"
									minLength="8"
									value={confirmarSenha}
									onChange={(evento) => setConfirmarSenha(evento.target.value)}
									required
								/>
							</>
						) : (
							<>
								<label htmlFor="email-recuperacao-senha">E-mail</label>
								<input
									id="email-recuperacao-senha"
									name="email"
									type="email"
									autoComplete="email"
									value={email}
									onChange={(evento) => setEmail(evento.target.value)}
									required
								/>
							</>
						)}
						{mensagem && <p className={erro ? 'mensagem-recuperacao erro' : 'mensagem-recuperacao'} role={erro ? 'alert' : 'status'}>{mensagem}</p>}
						<button className="hover-botao-vermelho" type="submit" disabled={carregando}>
							{carregando
								? 'Aguarde...'
								: redefinindo ? 'Redefinir senha' : 'Obter link'}
						</button>
					</form>
				)}
				{concluido && mensagem && (
					<p className="mensagem-recuperacao" role="status">{mensagem}</p>
				)}

				<Link to={concluido ? (tipo === 'ong' ? '/login-ong' : '/login-usuario') : '/'} className="voltar-inicio-recuperacao-senha">
					{concluido ? 'Ir para o login' : 'Voltar para o início'}
				</Link>
			</section>
		</main>
	);
}
