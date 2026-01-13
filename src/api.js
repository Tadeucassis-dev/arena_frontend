const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function getProdutos() {
  const res = await fetch(`${BASE_URL}/produtos`);
  if (!res.ok) throw new Error((await res.text()) || 'Falha ao buscar produtos');
  return res.json();
}

export async function criarProduto(payload) {
  const res = await fetch(`${BASE_URL}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Falha ao criar produto');
  return res.json();
}

export async function adicionarItemComanda(payload) {
  const { comandaId, produtoId, quantidade } = payload;
  const res = await fetch(`${BASE_URL}/comandas/${comandaId}/itens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produtoId, quantidade }),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Falha ao adicionar item na comanda');
  return res.json();
}

export async function abrirComanda(payload) {
  const res = await fetch(`${BASE_URL}/comandas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Falha ao abrir comanda');
  return res.json();
}

export async function fecharComanda(id) {
  const res = await fetch(`${BASE_URL}/comandas/${id}/fechar`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error((await res.text()) || 'Falha ao fechar comanda');
  return res.json();
}

export async function listarComandas(status) {
  const url = status ? `${BASE_URL}/comandas?status=${encodeURIComponent(status)}` : `${BASE_URL}/comandas`;
  const res = await fetch(url);
  if (!res.ok) throw new Error((await res.text()) || 'Falha ao listar comandas');
  return res.json();
}

export async function buscarComandaPorNome(nomeCliente) {
  const lista = await listarComandas();
  const termo = String(nomeCliente).toLowerCase();
  const match = lista.find(c => (c.nomeCliente || '').toLowerCase().includes(termo));
  if (!match) throw new Error('Comanda não encontrada pelo nome');
  return match;
}

export async function buscarComandasPorNome(nomeCliente, { status = 'ABERTA' } = {}) {
  const lista = await listarComandas(status);
  const termo = String(nomeCliente).toLowerCase();
  return lista.filter(c => (c.nomeCliente || '').toLowerCase().includes(termo));
}

export async function getComanda(id) {
  const byId = await fetch(`${BASE_URL}/comandas/${id}`);
  if (byId.ok) return byId.json();
  const lista = await listarComandas();
  const found = (lista || []).find(c => Number(c.id) === Number(id));
  if (!found) throw new Error('Comanda não encontrada');
  return found;
}