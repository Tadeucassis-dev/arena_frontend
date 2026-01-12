const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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