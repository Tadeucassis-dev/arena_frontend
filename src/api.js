const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

if (!BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL não está definida. Verifique o arquivo .env ou as variáveis do Netlify.'
  );
}

// helper padrão
async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Erro na requisição');
  }

  // alguns endpoints podem não retornar body
  if (res.status === 204) return null;
  return res.json();
}

/* ===================== PRODUTOS ===================== */

export function getProdutos() {
  return request('/produtos');
}

export function criarProduto(payload) {
  return request('/produtos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* ===================== COMANDAS ===================== */

export function abrirComanda(payload) {
  return request('/comandas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listarComandas(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request(`/comandas${query}`);
}

export function getComanda(id) {
  return request(`/comandas/${id}`);
}

export function fecharComanda(id) {
  return request(`/comandas/${id}/fechar`, {
    method: 'POST',
  });
}

export function adicionarItemComanda({ comandaId, produtoId, quantidade }) {
  return request(`/comandas/${comandaId}/itens`, {
    method: 'POST',
    body: JSON.stringify({ produtoId, quantidade }),
  });
}

/* ===================== BUSCAS ===================== */

export async function buscarComandasPorNome(
  nomeCliente,
  { status = 'ABERTA' } = {}
) {
  const lista = await listarComandas(status);
  const termo = String(nomeCliente).toLowerCase();

  return lista.filter(c =>
    (c.nomeCliente || '').toLowerCase().includes(termo)
  );
}

export async function buscarComandaPorNome(nomeCliente) {
  const lista = await listarComandas();
  const termo = String(nomeCliente).toLowerCase();

  const match = lista.find(c =>
    (c.nomeCliente || '').toLowerCase().includes(termo)
  );

  if (!match) {
    throw new Error('Comanda não encontrada pelo nome');
  }

  return match;
}
