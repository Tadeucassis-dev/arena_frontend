const BASE_URL = 'https://arena-api-prod.onrender.com';

export async function getProdutos() {
  const res = await fetch(`${BASE_URL}/produtos`);
  if (!res.ok) throw new Error(`GET /produtos falhou: ${res.status}`);
  return res.json();
}

export async function criarProduto({ nome, preco, estoque }) {
  const res = await fetch(`${BASE_URL}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, preco, estoque })
  });
  if (!res.ok) throw new Error(`POST /produtos falhou: ${res.status}`);
  return res.json();
}

export async function adicionarItemComanda({ comandaId, produtoId, quantidade }) {
  const res = await fetch(`${BASE_URL}/comandas/${comandaId}/itens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produtoId, quantidade })
  });
  if (!res.ok) throw new Error(`POST /comandas/${comandaId}/itens falhou: ${res.status}`);
  return res.json();
}