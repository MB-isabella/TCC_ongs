import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import BarraCatalogo from '../components/BarraCatalogo';
import { getDadosSessao, getPerfilOngsProprietario } from '../services/catalogo';
import './ProprietarioDoacoes.css';

function formatarData(data) {
	const dataDoacao = new Date(data);
	if (Number.isNaN(dataDoacao.getTime())) return 'Data indisponível';

	return new Intl.DateTimeFormat('pt-BR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(dataDoacao);
}

export default function ProprietarioDoacoes() {
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const ongId = sessao?.id;
	const ongAutenticada = Boolean(ongId && sessao?.tipo === 'ong');
	const [perfil, setPerfil] = useState(null);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState('');

	useEffect(() => {
		if (!ongAutenticada) return undefined;

		const controller = new AbortController();
		getPerfilOngsProprietario(ongId, controller.signal)
			.then(setPerfil)
			.catch((erroRequisicao) => {
				if (erroRequisicao.name !== 'AbortError') setErro(erroRequisicao.message);
			})
			.finally(() => {
				if (!controller.signal.aborted) setCarregando(false);
			});

		return () => controller.abort();
	}, [ongAutenticada, ongId]);

	const encerrarSessao = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('tipoConta');
		localStorage.removeItem('imagemPerfil');
		navigate('/');
	};

	if (!ongAutenticada) {
		return <Navigate to="/login-ong" replace state={{ from: { pathname: '/verificar-doacoes-ong' } }} />;
	}

	const doacoes = Array.isArray(perfil?.datasDoacoes) ? perfil.datasDoacoes : [];
	const quantidadeDoacoes = Number.isFinite(perfil?.quantidadeDoacoes)
		? perfil.quantidadeDoacoes
		: doacoes.length;

	return (
		<div className="pagina-doacoes-proprietario">
			<BarraCatalogo
				imagemPerfil={perfil?.logo}
				destinoPerfil="/perfil-ong-proprietario"
				rotuloPerfil="Perfil da ONG"
				aoSair={encerrarSessao}
			/>

			<main className="conteudo-doacoes-proprietario conteudo-com-barra-catalogo">
				{carregando && <p className="status-doacoes-proprietario" role="status">Carregando doações...</p>}
				{erro && <p className="status-doacoes-proprietario erro-doacoes-proprietario" role="alert">{erro}</p>}
				{perfil && (
					<section className="painel-doacoes-proprietario" aria-labelledby="titulo-doacoes-proprietario">
						<header className="cabecalho-doacoes-proprietario">
							<Link to="/perfil-ong-proprietario" className="voltar-doacoes-proprietario">
								<span aria-hidden="true">‹</span> Voltar
							</Link>
							{perfil.logo
								? <img className="logo-doacoes-proprietario" src={perfil.logo} alt={`Logo da ONG ${perfil.nome}`} />
								: <div className="logo-doacoes-proprietario logo-doacoes-vazio-proprietario" role="img" aria-label="Logo não cadastrada">
									<img src="/images/usuariobranco.png" alt="" />
								</div>}
							<div className="titulo-cartao-doacoes-proprietario">
								<strong>{perfil.nome}</strong>
								<h1 id="titulo-doacoes-proprietario">
									<img src="/images/doacao.png" alt="" />
									<span>Verificação de doações</span>
								</h1>
							</div>
						</header>

						<div className="resumo-doacoes-proprietario">
							<span>Quantidade de doações recebidas</span>
							<strong>{quantidadeDoacoes} {quantidadeDoacoes === 1 ? 'doação' : 'doações'}</strong>
						</div>

						<div className="lista-doacoes-proprietario" aria-label="Doações recebidas">
							{doacoes.length > 0 ? doacoes.map((data, indice) => (
								<article className="item-doacao-proprietario" key={`${data}-${indice}`}>
									<strong>Doação Recebida!</strong>
									<time dateTime={data}>{formatarData(data)}</time>
								</article>
							)) : !carregando && (
								<p className="sem-doacoes-proprietario">Ainda não há doações recebidas.</p>
							)}
						</div>
					</section>
				)}
			</main>
		</div>
	);
}