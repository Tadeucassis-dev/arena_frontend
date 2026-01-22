const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://arena-api-prod.onrender.com';

// helper padrão
async function request(url, options = {}) {
  const hasBody = options && options.body != null;
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Erro na requisição');
  }

  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
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

export function atualizarProduto(id, payload) {
  return request(`/produtos/${id}`, {
    method: 'PUT',
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

export function atualizarComanda(id, payload) {
  return request(`/comandas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deletarComanda(id, confirmar = true) {
  const q = confirmar ? 'true' : 'false';
  return request(`/comandas/${id}?confirmar=${q}`, {
    method: 'DELETE',
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
