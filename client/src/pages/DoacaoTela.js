import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { gerarDoacao, getDadosSessao, getInfoOngDoacao } from '../services/catalogo';

export default function DoacaoTela() {
	const { id } = useParams();
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const token = localStorage.getItem('token');
	const usuarioId = sessao?.id;
	const usuarioTipo = sessao?.tipo;
	const usuarioLogado = Boolean(token && usuarioId && usuarioTipo === 'usuario');
	const [ong, setOng] = useState(null);
	const [carregando, setCarregando] = useState(true);
	const [enviando, setEnviando] = useState(false);
	const [chaveVisivel, setChaveVisivel] = useState(false);
	const [erro, setErro] = useState('');
	const [sucesso, setSucesso] = useState('');

	useEffect(() => {
		if (!usuarioLogado) return undefined;

		const controller = new AbortController();
		getInfoOngDoacao(id, token, controller.signal)
			.then(setOng)
			.catch((erroRequisicao) => {
				if (erroRequisicao.name !== 'AbortError') setErro(erroRequisicao.message);
			})
			.finally(() => {
				if (!controller.signal.aborted) setCarregando(false);
			});

		return () => controller.abort();
	}, [id, token, usuarioLogado]);

	const finalizarDoacao = async () => {
		setErro('');
		setEnviando(true);

		try {
			await gerarDoacao(id, token);
			setSucesso('Doação bem-sucedida!');
			await new Promise((resolve) => setTimeout(resolve, 1000));
			navigate(`/perfil-ong/${encodeURIComponent(id)}`);
		} catch (erroRequisicao) {
			setErro(erroRequisicao.message);
		} finally {
			setEnviando(false);
		}
	};

	if (!usuarioLogado) {
		return (
			<Navigate
				to="/login-usuario"
				replace
				state={{ from: { pathname: `/doacao/${encodeURIComponent(id)}` } }}
			/>
		);
	}

	return (
		<main className="pagina-doacao" style={{ backgroundImage: "url('/images/telainicialfundo.png')" }}>
			<Link to={`/perfil-ong/${encodeURIComponent(id)}`} className="voltar-perfil-doacao">
				<span aria-hidden="true">‹</span>
				Voltar
			</Link>

			<section className="cartao-doacao" aria-labelledby="titulo-doacao">
				<header className="cabecalho-doacao">
					<img className="marca-doacao" src="/images/logovermelha.PNG" alt="" />
					<div>
						<p>Faça sua doação!</p>
						<h1 id="titulo-doacao">Doe no Pix</h1>
					</div>
				</header>

				{carregando && <p className="status-doacao" role="status">Carregando dados da ONG...</p>}
				{erro && <p className="mensagem-doacao erro-doacao" role="alert">{erro}</p>}

				{ong && !carregando && (
					<>
						<h2 className="nome-ong-doacao">{ong.nome}</h2>
						<div className="qr-doacao">
							<p>QR Code</p>
							{ong.qrcode
								? <img src={ong.qrcode} alt={`QR Code Pix da ONG ${ong.nome}`} />
								: <p className="qr-indisponivel">QR Code indisponível</p>}
						</div>

						<div className="chave-pix-doacao">
							<label htmlFor="chave-pix">Chave Pix</label>
							<div>
								<input
									id="chave-pix"
									type={chaveVisivel ? 'text' : 'password'}
									value={ong.chave_pix || ''}
									readOnly
									aria-label="Chave Pix da ONG"
								/>
								<button
									type="button"
									onClick={() => setChaveVisivel((visivel) => !visivel)}
									aria-label={chaveVisivel ? 'Ocultar chave Pix' : 'Revelar chave Pix'}
									aria-pressed={chaveVisivel}
								>
									{chaveVisivel ? 'Ocultar' : 'Revelar'}
								</button>
							</div>
						</div>

						<button
							type="button"
							className="botao-finalizar-doacao hover-botao-vermelho"
							onClick={finalizarDoacao}
							disabled={enviando || Boolean(sucesso)}
						>
							{enviando ? 'Finalizando...' : 'Finalizar doação'}
						</button>
						<p className="aviso-finalizar-doacao">
							! Clique aqui apenas se tiver efetuado o pix, caso contrário, clique no botão voltar
						</p>
						{sucesso && <p className="mensagem-doacao sucesso-doacao" role="status">{sucesso}</p>}
					</>
				)}
			</section>
		</main>
	);
}