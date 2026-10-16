import { Link } from 'react-router-dom';

export default function RecuperacaoSenha() {
	const impedirEnvioSemIntegracao = (evento) => {
		evento.preventDefault();
	};

	return (
		<main className="pagina-recuperacao-senha">
			<section className="cartao-recuperacao-senha" aria-labelledby="titulo-recuperacao-senha">
				<img className="icone-recuperacao-senha" src="/images/logovermelha.PNG" alt="" />
				<h1 id="titulo-recuperacao-senha">Recuperação de senha</h1>
				<p className="instrucao-recuperacao-senha">
					Digite seu e-mail abaixo para<br />
					receber uma mensagem com<br />
					link para redefinição de<br />
					senha
				</p>

				<form className="form-recuperacao-senha" onSubmit={impedirEnvioSemIntegracao}>
					<label htmlFor="email-recuperacao-senha">E-mail</label>
					<input
						id="email-recuperacao-senha"
						name="email"
						type="email"
						autoComplete="email"
						required
					/>
					<button className="hover-botao-vermelho" type="submit">Obter link</button>
				</form>

				<Link to="/" className="voltar-inicio-recuperacao-senha">
					Voltar para o início
				</Link>
			</section>
		</main>
	);
}
