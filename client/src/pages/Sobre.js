import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BarraCatalogo from '../components/BarraCatalogo';
import { getDadosSessao, getPerfilOng, getPerfilUsuario } from '../services/catalogo';

export default function Sobre() {
	const navigate = useNavigate();
	const sessao = getDadosSessao();
	const [fotoPerfil, setFotoPerfil] = useState(sessao?.imagemPerfil || '');
	const sessaoId = sessao?.id;
	const sessaoTipo = sessao?.tipo;
	const imagemPerfilSessao = sessao?.imagemPerfil;

	useEffect(() => {
		if (!sessaoId || imagemPerfilSessao) return undefined;

		const controller = new AbortController();
		const requisicaoPerfil = sessaoTipo === 'ong'
			? getPerfilOng(sessaoId, controller.signal).then((perfil) => perfil.logo)
			: getPerfilUsuario(sessaoId, controller.signal).then((perfil) => perfil.imagem_perfil);

		requisicaoPerfil
			.then((imagem) => {
				if (imagem) setFotoPerfil(imagem);
			})
			.catch((erroRequisicao) => {
				if (erroRequisicao.name !== 'AbortError') {
					console.error('Não foi possível carregar a imagem de perfil:', erroRequisicao);
				}
			});

		return () => controller.abort();
	}, [sessaoId, sessaoTipo, imagemPerfilSessao]);

	const abrirPerfil = () => {
		if (sessao?.tipo === 'ong') {
			navigate('/perfil-ong-proprietario');
			return;
		}

		if (sessao) navigate('/perfil-usuario');
	};

	const encerrarSessao = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('tipoConta');
		localStorage.removeItem('imagemPerfil');
		navigate('/');
	};

	return (
		<div className="pagina-sobre">
			<BarraCatalogo
				imagemPerfil={fotoPerfil}
				destinoPerfil={sessao ? '/perfil-usuario' : '/login-usuario'}
				rotuloPerfil={sessao ? 'Perfil' : 'Entrar'}
				aoAbrirPerfil={sessao ? abrirPerfil : undefined}
				aoSair={sessao ? encerrarSessao : undefined}
			/>
			<main className="conteudo-pagina-sobre conteudo-com-barra-catalogo">
				<section className="cartao-sobre" aria-labelledby="titulo-sobre">
					<Link to="/catalogo" className="voltar-catalogo-sobre">
						<span aria-hidden="true">‹</span>
						Voltar
					</Link>
					<div className="cabecalho-sobre">
						<img className="logo-sobre" src="/images/logovermelha.PNG" alt="Logo UniLinorte" />
						<h1 id="titulo-sobre">Sobre os desenvolvedores</h1>
					</div>
					<div className="texto-sobre">
						<p>
							A dupla desenvolvedora do website é composta por duas estudantes do curso de informática para internet do Instituto Federal Catarinense - Campus Sombrio.
						</p>
						<p>
							O presente sistema é parte do resultado do projeto de conclusão de curso exigido como etapa final do curso técnico de informática.
						</p>
						<p>
							Temos como principal objetivo reunir as ONGs locais em um ambiente, trazendo a visão geral de cada uma, apresentando seus perfis e oferecendo-as esse espaço especificamente criado para mostrar parte de seus trabalhos, além de facilitar a pesquisa por essas organizações. O website traz também uma função de facilitar doações online para as organizações que o usuário deseja contribuir com o trabalho.
						</p>
					</div>
				</section>
			</main>
		</div>
	);
}