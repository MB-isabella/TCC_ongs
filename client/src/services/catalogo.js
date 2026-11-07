import { apiUrl } from './api';

async function obterJson(url, options) {
	const resposta = await fetch(url, options);
	const dados = await resposta.json();

	if (!resposta.ok) {
		throw new Error(dados.message || dados.mensagem || dados.error || 'Não foi possível carregar os dados.');
	}

	return dados;
}

export function getOngs(signal) {
	return obterJson(apiUrl('catalogo'), { signal });
}

export function buscarOngs(termo, signal) {
	const parametros = new URLSearchParams({ q: termo });
	return obterJson(`${apiUrl('catalogo/pesquisa')}?${parametros}`, { signal });
}

export function getPerfilOng(id, signal) {
	return obterJson(apiUrl(`catalogo/perfil-ong/${encodeURIComponent(id)}`), { signal });
}

export function getPerfilOngsProprietario(id, signal) {
	return obterJson(apiUrl(`ong/minha-ong/${encodeURIComponent(id)}`), { signal });
}

export function editarOng(id, dados) {
	return obterJson(apiUrl(`ong/editar-ong/${encodeURIComponent(id)}`), {
		method: 'PUT',
		body: dados,
	});
}

export function getPerfilUsuario(id, signal) {
	return obterJson(apiUrl(`usuario/perfil-usuario/${encodeURIComponent(id)}`), { signal });
}

export function editarUsuario(id, dados) {
	return obterJson(apiUrl(`usuario/editar-usuario/${encodeURIComponent(id)}`), {
		method: 'PUT',
		body: dados,
	});
}

export function deletarUsuario(id, senha) {
	return obterJson(apiUrl(`usuario/deletar-usuario/${encodeURIComponent(id)}`), {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ senha }),
	});
}

export function deletarOng(id, senha) {
	return obterJson(apiUrl(`ong/deletar-ong/${encodeURIComponent(id)}`), {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ senha }),
	});
}

export function getInfoOngDoacao(id, token, signal) {
	return obterJson(apiUrl(`doacao/${encodeURIComponent(id)}`), {
		headers: { Authorization: `Bearer ${token}` },
		signal,
	});
}

export function gerarDoacao(id, token) {
	return obterJson(apiUrl(`doacao/registro-doacao/${encodeURIComponent(id)}`), {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({}),
	});
}

export function getDadosSessao() {
	const token = localStorage.getItem('token');
	if (!token) return null;

	try {
		const partePayload = token.split('.')[1];
		if (!partePayload) throw new Error('Token de sessão inválido.');
		const payload = JSON.parse(atob(partePayload.replace(/-/g, '+').replace(/_/g, '/')));
		if (!payload.userId) throw new Error('Token sem identificador de usuário.');

		return {
			id: payload.userId,
			tipo: localStorage.getItem('tipoConta') || 'usuario',
			imagemPerfil: localStorage.getItem('imagemPerfil') || '',
		};
	} catch (erro) {
		console.error('Não foi possível ler os dados da sessão:', erro);
		return null;
	}
}
