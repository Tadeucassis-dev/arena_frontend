const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://arena-api-prod.onrender.com'

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const hasBody = options.body != null

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    let message = `Erro ${res.status}`
    try {
      const text = await res.text()
      if (text) message = text
    } catch {}
    throw new Error(message)
  }

  if (res.status === 204) {
    return null as T
  }

  return res.json()
}

/* ================= PRODUTOS ================= */

export function getProdutos() {
  return request('/produtos')
}

export function criarProduto({
  nome,
  preco,
  estoque,
}: {
  nome: string
  preco: number
  estoque: number
}) {
  return request('/produtos', {
    method: 'POST',
    body: JSON.stringify({ nome, preco, estoque }),
  })
}

/* ================= COMANDAS ================= */

export function adicionarItemComanda({
  comandaId,
  produtoId,
  quantidade,
}: {
  comandaId: number
  produtoId: number
  quantidade: number
}) {
  return request(`/comandas/${comandaId}/itens`, {
    method: 'POST',
    body: JSON.stringify({ produtoId, quantidade }),
  })
}
