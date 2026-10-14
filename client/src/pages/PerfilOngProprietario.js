import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import BarraCatalogo from '../components/BarraCatalogo';
import CarrosselOngs from '../components/CarrosselOngs';
import Footer from '../components/Footer';
import { getDadosSessao, getPerfilOngsProprietario } from '../services/catalogo';
import './PerfilOngProprietario.css';

export default function PerfilOngProprietario() {
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const ongId = sessao?.id;
	const ongAutenticada = Boolean(ongId && sessao?.tipo === 'ong');
	const [ong, setOng] = useState(null);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState('');

	useEffect(() => {
		if (!ongAutenticada) return undefined;

		const controller = new AbortController();
		getPerfilOngsProprietario(ongId, controller.signal)
			.then(setOng)
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
		return <Navigate to="/login-ong" replace state={{ from: { pathname: '/perfil-ong-proprietario' } }} />;
	}

	return (
		<div className="pagina-perfil-ong-proprietario">
			<BarraCatalogo
				imagemPerfil={ong?.logo}
				destinoPerfil="/perfil-ong-proprietario"
				rotuloPerfil="Perfil da ONG"
				aoSair={encerrarSessao}
			/>

			<main className="conteudo-ong-proprietario conteudo-com-barra-catalogo">
				{carregando && <p className="status-ong-proprietario" role="status">Carregando perfil da ONG...</p>}
				{erro && <p className="status-ong-proprietario erro-ong-proprietario" role="alert">{erro}</p>}
				{ong && (
					<>
						<section className="painel-ong-proprietario" aria-labelledby="nome-ong-proprietario">
							<div className="banner-ong-proprietario">
								{ong.banner && <img src={ong.banner} alt={`Banner da ONG ${ong.nome}`} />}
								<Link className="botao-editar-ong-proprietario hover-botao-vermelho" to="/editar-perfil-ong">Editar Perfil</Link>
							</div>

							<div className="identidade-ong-proprietario">
								{ong.logo
									? <img className="logo-ong-proprietario" src={ong.logo} alt={`Logo da ONG ${ong.nome}`} />
									: <div className="logo-ong-proprietario logo-ong-vazio-proprietario" role="img" aria-label="Logo não cadastrada">
										<img src="/images/usuariobranco.png" alt="" />
									</div>}
								<div className="cartao-identidade-ong-proprietario">
									<strong>{ong.login || '—'}</strong>
									<h1 id="nome-ong-proprietario">{ong.nome}</h1>
								</div>
							</div>

							<dl className="dados-ong-proprietario">
								<div className="dado-instagram-ong-proprietario">
									<dt className="sr-only-ong-proprietario">Instagram</dt>
									<dd>
										<img src="/images/instagram.png" alt="" />
										<span>{ong.instagram?.trim() || 'Instagram não informado'}</span>
									</dd>
								</div>
								<div><dt>CNPJ</dt><dd>{ong.cnpj || '—'}</dd></div>
								<div><dt>Região</dt><dd>{ong.cidade_regiao || '—'}</dd></div>
								<div><dt>E-mail</dt><dd>{ong.email || '—'}</dd></div>
							</dl>

							{Array.isArray(ong.categoria) && ong.categoria.length > 0 && (
								<div className="categorias-ong-proprietario">
									<strong>Categorias</strong>
									<ul>
										{ong.categoria.map((categoria) => <li key={categoria}>{categoria}</li>)}
									</ul>
								</div>
							)}

							<div className="detalhes-ong-proprietario">
								<section className="sobre-ong-proprietario" aria-labelledby="titulo-sobre-ong-proprietario">
									<h2 id="titulo-sobre-ong-proprietario">
										<img src="/images/infoong.png" alt="" />
										<span>Sobre nós</span>
									</h2>
									<p>{ong.descricao || 'A ONG ainda não adicionou uma descrição.'}</p>
								</section>
								<section className="galeria-ong-proprietario" aria-label={`Imagens de ${ong.nome}`}>
									<CarrosselOngs
										rotulo={`Carrossel de imagens da ONG ${ong.nome}`}
										mostrarControles
										imagens={ong.carrossel}
									/>
								</section>
							</div>

							<div className="acoes-ong-proprietario">
								<section className="pagamento-ong-proprietario" aria-label="Informações para doação">
									<div className="qrcode-ong-proprietario">
										<h2>QR Code</h2>
										{ong.qrcode
											? <img src={ong.qrcode} alt={`QR Code PIX da ONG ${ong.nome}`} />
											: <p>QR Code indisponível</p>}
									</div>
									<div className="pix-ong-proprietario">
										<h2>Chave Pix</h2>
										<p>{ong.chave_pix || 'Chave Pix não informada'}</p>
										<Link className="botao-verificar-doacoes-ong hover-botao-vermelho" to="/verificar-doacoes-ong">
											<img src="/images/doacao.png" alt="" />
											<span>Verificar Doações</span>
										</Link>
									</div>
								</section>
								<div className="excluir-ong-proprietario">
									<Link className="hover-botao-vermelho sem-gradiente-uniforme" to="/excluir-conta-ong">EXCLUIR CONTA</Link>
								</div>
							</div>
						</section>
						<Footer />
					</>
				)}
			</main>
		</div>
	);
}
