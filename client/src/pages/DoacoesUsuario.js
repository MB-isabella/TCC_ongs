import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import BarraCatalogo from '../components/BarraCatalogo';
import { getDadosSessao, getPerfilUsuario } from '../services/catalogo';
import './PerfilUsuario.css';
import './DoacoesUsuario.css';

const IMAGEM_PLACEHOLDER = '/images/perfilplaceholder.png';

function formatarData(data) {
	if (!data) return 'Data indisponível';

	const dataFormatada = new Date(data);
	return Number.isNaN(dataFormatada.getTime())
		? 'Data indisponível'
		: dataFormatada.toLocaleDateString('pt-BR');
}

export default function DoacoesUsuario() {
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const usuarioId = sessao?.id;
	const usuarioAutenticado = Boolean(usuarioId && sessao?.tipo === 'usuario');
	const [usuario, setUsuario] = useState(null);
	const [fotoPerfil, setFotoPerfil] = useState(sessao?.imagemPerfil || IMAGEM_PLACEHOLDER);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState('');

	useEffect(() => {
		if (!usuarioAutenticado) return undefined;

		const controller = new AbortController();
		getPerfilUsuario(usuarioId, controller.signal)
			.then((perfil) => {
				setUsuario(perfil);
				setFotoPerfil(perfil.imagem_perfil || IMAGEM_PLACEHOLDER);
				if (perfil.imagem_perfil) localStorage.setItem('imagemPerfil', perfil.imagem_perfil);
			})
			.catch((erroRequisicao) => {
				if (erroRequisicao.name !== 'AbortError') setErro(erroRequisicao.message);
			})
			.finally(() => {
				if (!controller.signal.aborted) setCarregando(false);
			});

		return () => controller.abort();
	}, [usuarioAutenticado, usuarioId]);

	const encerrarSessao = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('tipoConta');
		localStorage.removeItem('imagemPerfil');
		navigate('/');
	};

	if (!usuarioAutenticado) {
		return <Navigate to="/login-usuario" replace state={{ from: { pathname: '/minhas-doacoes' } }} />;
	}

	const doacoes = usuario?.doacoes || [];

	return (
		<div className="pagina-perfil-usuario pagina-doacoes-usuario">
			<BarraCatalogo
				imagemPerfil={fotoPerfil === IMAGEM_PLACEHOLDER ? '' : fotoPerfil}
				destinoPerfil="/perfil-usuario"
				rotuloPerfil="Perfil"
				aoSair={encerrarSessao}
			/>

			<main className="conteudo-perfil-usuario conteudo-doacoes-usuario conteudo-com-barra-catalogo">
				<div className="painel-doacoes-usuario">
					<Link to="/perfil-usuario" className="voltar-catalogo-perfil-usuario">
						<span aria-hidden="true">‹</span>
						Voltar
					</Link>

					<section className="cabecalho-doacoes-usuario" aria-labelledby="titulo-doacoes-usuario">
						<div className="moldura-foto-perfil-usuario moldura-foto-doacoes-usuario">
							<img
								className={fotoPerfil === IMAGEM_PLACEHOLDER ? 'imagem-placeholder-perfil-usuario' : ''}
								src={fotoPerfil}
								alt="Foto de perfil do usuário"
								onError={() => setFotoPerfil(IMAGEM_PLACEHOLDER)}
							/>
						</div>

						<div className="identificacao-doacoes-usuario">
							<div className="cartao-login-perfil-usuario cartao-login-doacoes-usuario">
								{carregando ? (
									<p role="status">Carregando perfil...</p>
								) : (
									<h1>{usuario?.login}</h1>
								)}
							</div>
							<div className="titulo-doacoes-usuario">
								<img src="/images/doacao.png" alt="" />
								<h2 id="titulo-doacoes-usuario">Minhas doações</h2>
							</div>
						</div>
					</section>

					{erro && <p className="erro-perfil-usuario" role="alert">{erro}</p>}

					<section className="lista-doacoes-usuario" aria-label="Doações realizadas">
						{carregando ? (
							<p className="estado-doacoes-usuario" role="status">Carregando doações...</p>
						) : doacoes.length > 0 ? (
							doacoes.map((doacao, indice) => (
								<article className="item-doacao-usuario" key={`${doacao.ong?.id || 'ong'}-${doacao.data || indice}-${indice}`}>
									<span>{doacao.ong?.nome || 'ONG não disponível'}</span>
									<time dateTime={doacao.data || undefined}>{formatarData(doacao.data)}</time>
								</article>
							))
						) : (
							<p className="estado-doacoes-usuario">Você ainda não realizou doações.</p>
						)}
					</section>
				</div>
			</main>
		</div>
	);
}
