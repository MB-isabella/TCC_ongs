import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiUrl } from '../services/api';
import '../styles/RedefinirSenha.css';

export default function RedefinirSenha() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token');
	const tipo = searchParams.get('tipo');
	const [senha, setSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [mensagemErro, setMensagemErro] = useState('');
	const [carregando, setCarregando] = useState(false);
	const [concluido, setConcluido] = useState(false);

	const enviarFormulario = async (evento) => {
		evento.preventDefault();
		setMensagemErro('');

		if (!token || !['ong', 'usuario'].includes(tipo)) {
			setMensagemErro('O link de redefinição é inválido ou expirou.');
			return;
		}

		if (senha !== confirmarSenha) {
			setMensagemErro('As senhas não coincidem.');
			return;
		}

		setCarregando(true);
		try {
			const resposta = await fetch(apiUrl('usuario/redefinir-senha'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, senha, tipo }),
			});
			const dados = await resposta.json();

			if (!resposta.ok) {
				throw new Error(dados.mensagem || 'Não foi possível redefinir sua senha.');
			}

			setConcluido(true);
		} catch (erroEnvio) {
			setMensagemErro(erroEnvio.message || 'Erro ao conectar com o servidor.');
		} finally {
			setCarregando(false);
		}
	};

	return (
		<main className="pagina-redefinir-senha">
			<section className="cartao-redefinir-senha" aria-labelledby="titulo-redefinir-senha">
				{concluido ? (
					<div className="sucesso-redefinir-senha" role="status">
						<span className="icone-sucesso-redefinir-senha" aria-hidden="true" />
						<h1 id="titulo-redefinir-senha">Nova senha<br />cadastrada!</h1>
					</div>
				) : (
					<>
						<img className="logo-redefinir-senha" src="/images/logovermelha.PNG" alt="" />
						<h1 id="titulo-redefinir-senha">Redefinição de senha</h1>
						<form className="form-redefinir-senha" onSubmit={enviarFormulario}>
							<label htmlFor="nova-senha">Nova senha</label>
							<input
								id="nova-senha"
								name="senha"
								type="password"
								autoComplete="new-password"
								minLength="8"
								value={senha}
								onChange={(evento) => setSenha(evento.target.value)}
								required
								disabled={carregando}
							/>
							<label htmlFor="confirmar-nova-senha">Repita nova senha</label>
							<input
								id="confirmar-nova-senha"
								name="confirmarSenha"
								type="password"
								autoComplete="new-password"
								minLength="8"
								value={confirmarSenha}
								onChange={(evento) => setConfirmarSenha(evento.target.value)}
								required
								disabled={carregando}
							/>
							{mensagemErro && <p className="erro-redefinir-senha" role="alert">{mensagemErro}</p>}
							<button
								className="botao-redefinir-senha hover-botao-vermelho sem-gradiente-uniforme"
								type="submit"
								disabled={carregando}
							>
								{carregando ? 'Aguarde...' : 'Redefinir'}
							</button>
						</form>
					</>
				)}
			</section>
		</main>
	);
}
