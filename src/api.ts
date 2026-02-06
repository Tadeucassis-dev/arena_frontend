const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://arena-api-prod.onrender.com'

/* ===================== TYPES ===================== */

type RequestOptions = RequestInit & {
  body?: BodyInit | null
}

/* ===================== HELPER ===================== */

async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const hasBody = options.body != null

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Erro na requisição')
  }

  // No Content
  if (res.status === 204) {
    return ([] as unknown) as T
  }

  const ct = res.headers.get('content-type') || ''

  // Se não vier JSON, nunca retornar null para listas
  if (!ct.includes('application/json')) {
    return ([] as unknown) as T
  }

  const data = await res.json()

  // Garantia extra
  if (data === null || data === undefined) {
    return ([] as unknown) as T
  }

  return data as T
}

/* ===================== MOCK ===================== */

const USE_MOCK = true
const STORAGE_KEY = 'arena_mock_db_v2'

const loadDb = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Erro ao carregar mock db', e)
  }

  return {
    produtos: [],
    comandas: [],
  }
}

let db = loadDb()

const saveDb = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms))

const MockAPI = {
  getProdutos: async () => {
    await delay()
    return db.produtos || []
  },

  listarComandas: async (status?: string) => {
    await delay()
    let list = db.comandas || []
    if (status) list = list.filter((c: any) => c.status === status)
    return JSON.parse(JSON.stringify(list))
  },

  getComanda: async (id: number) => {
    await delay()
    const c = (db.comandas || []).find((x: any) => x.id === Number(id))
    if (!c) throw new Error('Comanda não encontrada')
    return JSON.parse(JSON.stringify(c))
  },

  getItensComanda: async (comandaId: number) => {
    await delay()
    const c = (db.comandas || []).find((x: any) => x.id === Number(comandaId))
    return JSON.parse(JSON.stringify(c?.itens || []))
  },

  criarProduto: async (payload: any) => {
    await delay()
    const newId = Date.now()
    const p = { id: newId, ...payload }
    if (!db.produtos) db.produtos = []
    db.produtos.push(p)
    saveDb()
    return p
  },

  atualizarProduto: async (id: number, payload: any) => {
    await delay()
    if (!db.produtos) return null
    const idx = db.produtos.findIndex((p: any) => p.id === Number(id))
    if (idx === -1) throw new Error('Produto não encontrado')
    db.produtos[idx] = { ...db.produtos[idx], ...payload }
    saveDb()
    return db.produtos[idx]
  },

  abrirComanda: async (payload: any) => {
    await delay()
    const newId = Date.now()
    const c = {
      id: newId,
      ...payload,
      status: 'ABERTA',
      itens: [],
      valorTotal: payload.valorDayUse || 0,
      dataAbertura: new Date().toISOString()
    }
    if (!db.comandas) db.comandas = []
    db.comandas.push(c)
    saveDb()
    return c
  },

  fecharComanda: async (id: number) => {
    await delay()
    const c = (db.comandas || []).find((x: any) => x.id === Number(id))
    if (!c) throw new Error('Comanda não encontrada')
    c.status = 'FECHADA'
    saveDb()
    return c
  },

  atualizarComanda: async (id: number, payload: any) => {
    await delay()
    const c = (db.comandas || []).find((x: any) => x.id === Number(id))
    if (!c) throw new Error('Comanda não encontrada')
    Object.assign(c, payload)
    saveDb()
    return c
  },

  deletarComanda: async (id: number) => {
    await delay()
    if (!db.comandas) return
    db.comandas = db.comandas.filter((x: any) => x.id !== Number(id))
    saveDb()
  },

  adicionarItemComanda: async (payload: any) => {
    await delay()
    const { comandaId, produtoId, quantidade } = payload
    const c = (db.comandas || []).find((x: any) => x.id === Number(comandaId))
    if (!c) throw new Error('Comanda não encontrada')

    const produto = (db.produtos || []).find((p: any) => p.id === Number(produtoId))
    const prodData = produto || { id: produtoId, nome: 'Produto Mock', preco: 10 }

    if (!c.itens) c.itens = []
    
    const existingItem = c.itens.find((it: any) => it.produto.id === Number(produtoId))
    if (existingItem) {
        existingItem.quantidade += quantidade
        existingItem.subtotal = existingItem.quantidade * (prodData.preco || 0)
    } else {
        c.itens.push({
            id: Date.now(),
            produto: prodData,
            quantidade,
            subtotal: quantidade * (prodData.preco || 0)
        })
    }

    c.valorTotal = (c.valorDayUse || 0) + c.itens.reduce((acc: number, it: any) => acc + it.subtotal, 0)
    
    saveDb()
    return c
  }
}

/* ===================== PRODUTOS ===================== */

export async function getProdutos() {
  if (USE_MOCK) return MockAPI.getProdutos()
  const res = await request('/produtos')
  return Array.isArray(res) ? res : []
}

export function criarProduto(payload: {
  nome: string
  preco?: number | null
  estoque?: number | null
}) {
  if (USE_MOCK) return MockAPI.criarProduto(payload)
  return request('/produtos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function atualizarProduto(
  id: number,
  payload: {
    nome?: string
    preco?: number | null
    estoque?: number | null
  }
) {
  if (USE_MOCK) return MockAPI.atualizarProduto(id, payload)
  return request(`/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/* ===================== COMANDAS ===================== */

export function abrirComanda(payload: {
  nomeCliente: string
  tipoCliente: 'ALUNO' | 'DAY_USE'
  valorDayUse: number | null
}) {
  if (USE_MOCK) return MockAPI.abrirComanda(payload)
  return request('/comandas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listarComandas(
  status?: 'ABERTA' | 'FECHADA'
) {
  if (USE_MOCK) return MockAPI.listarComandas(status)
  const query = status ? `?status=${status}` : ''
  const res = await request(`/comandas${query}`)
  return Array.isArray(res) ? res : []
}

export async function getComanda(id: number) {
  if (USE_MOCK) return MockAPI.getComanda(id)
  return request(`/comandas/${id}`)
}

export function fecharComanda(id: number) {
  if (USE_MOCK) return MockAPI.fecharComanda(id)
  return request(`/comandas/${id}/fechar`, {
    method: 'POST',
  })
}

export function atualizarComanda(
  id: number,
  payload: {
    nomeCliente?: string
    tipoCliente?: 'ALUNO' | 'DAY_USE'
    valorDayUse?: number | null
  }
) {
  if (USE_MOCK) return MockAPI.atualizarComanda(id, payload)
  return request(`/comandas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deletarComanda(
  id: number,
  confirmar = true
) {
  if (USE_MOCK) return MockAPI.deletarComanda(id)
  return request(`/comandas/${id}?confirmar=${confirmar}`, {
    method: 'DELETE',
  })
}

export function adicionarItemComanda(payload: {
  comandaId: number
  produtoId: number
  quantidade: number
}) {
  if (USE_MOCK) return MockAPI.adicionarItemComanda(payload)
  const { comandaId, produtoId, quantidade } = payload

  return request(`/comandas/${comandaId}/itens`, {
    method: 'POST',
    body: JSON.stringify({ produtoId, quantidade }),
  })
}

export async function getItensComanda(comandaId: number) {
  if (USE_MOCK) return MockAPI.getItensComanda(comandaId)
  const res = await request(`/comandas/${comandaId}/itens`)
  return Array.isArray(res) ? res : []
}

/* ===================== BUSCAS ===================== */

export async function buscarComandasPorNome(
  nomeCliente: string,
  status: 'ABERTA' | 'FECHADA' = 'ABERTA'
) {
  const lista = (await listarComandas(status)) || []
  const termo = nomeCliente.toLowerCase()

  return lista.filter((c: any) =>
    (c.nomeCliente || '').toLowerCase().includes(termo)
  )
}

export async function buscarComandaPorNome(nomeCliente: string) {
  const lista = (await listarComandas()) || []
  const termo = nomeCliente.toLowerCase()

  const match = lista.find((c: any) =>
    (c.nomeCliente || '').toLowerCase().includes(termo)
  )

  if (!match) {
    throw new Error('Comanda não encontrada pelo nome')
  }

  return match
}
