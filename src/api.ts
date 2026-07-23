const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080'

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

// Usa MOCK em desenvolvimento, API real em produção automaticamente
const USE_MOCK = import.meta.env.DEV
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

const recalcComandaTotal = (comanda: any) => {
  comanda.valorTotal =
    (comanda.valorDayUse || 0) +
    (comanda.itens || []).reduce((acc: number, it: any) => acc + it.subtotal, 0)
}

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

  deletarProduto: async (id: number) => {
    await delay()
    if (!db.produtos) return
    db.produtos = db.produtos.filter((p: any) => p.id !== Number(id))
    saveDb()
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
    const comanda = db.comandas.find((x: any) => x.id === Number(id))
    if (comanda?.itens?.length) {
      comanda.itens.forEach((item: any) => {
        const produto = (db.produtos || []).find((p: any) => p.id === Number(item.produto?.id))
        if (produto) {
          produto.estoque = (produto.estoque || 0) + (item.quantidade || 0)
        }
      })
    }
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

    if (produto) {
      const estoqueAtual = produto.estoque || 0
      if (estoqueAtual < quantidade) {
        throw new Error('Estoque insuficiente')
      }
      produto.estoque = estoqueAtual - quantidade
    }

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

    recalcComandaTotal(c)
    
    saveDb()
    return c
  },

  atualizarQuantidadeItem: async (payload: { comandaId: number, produtoId: number, quantidade: number }) => {
    await delay()
    const { comandaId, produtoId, quantidade } = payload
    const c = (db.comandas || []).find((x: any) => x.id === Number(comandaId))
    if (!c) throw new Error('Comanda não encontrada')
    if (!c.itens) c.itens = []

    const itemIndex = c.itens.findIndex((it: any) => it.produto.id === Number(produtoId))
    
    if (itemIndex === -1) {
      throw new Error('Item não encontrado')
    }

    const item = c.itens[itemIndex]
    const produto = (db.produtos || []).find((p: any) => p.id === Number(produtoId))
    const quantidadeAnterior = item.quantidade || 0
    const diferenca = quantidade - quantidadeAnterior

    if (quantidade <= 0) {
      // Remove o item
      if (produto) {
        produto.estoque = (produto.estoque || 0) + quantidadeAnterior
      }
      c.itens.splice(itemIndex, 1)
    } else {
      if (produto) {
        if (diferenca > 0) {
          const estoqueAtual = produto.estoque || 0
          if (estoqueAtual < diferenca) {
            throw new Error('Estoque insuficiente')
          }
          produto.estoque = estoqueAtual - diferenca
        } else if (diferenca < 0) {
          produto.estoque = (produto.estoque || 0) + Math.abs(diferenca)
        }
      }

      // Atualiza a quantidade
      item.quantidade = quantidade
      item.subtotal = quantidade * (item.produto.preco || 0)
    }

    recalcComandaTotal(c)
    
    saveDb()
    return c
  },

  removerItemComanda: async (payload: { comandaId: number, itemId: number }) => {
    await delay()
    const { comandaId, itemId } = payload
    const c = (db.comandas || []).find((x: any) => x.id === Number(comandaId))
    if (!c) throw new Error('Comanda não encontrada')
    if (!c.itens) c.itens = []
    const item = c.itens.find((it: any) => it.id === Number(itemId))
    if (item) {
      const produto = (db.produtos || []).find((p: any) => p.id === Number(item.produto?.id))
      if (produto) {
        produto.estoque = (produto.estoque || 0) + (item.quantidade || 0)
      }
    }

    c.itens = c.itens.filter((it: any) => it.id !== Number(itemId))
    recalcComandaTotal(c)
    
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

export function deletarProduto(id: number) {
  if (USE_MOCK) return MockAPI.deletarProduto(id)
  return request(`/produtos/${id}`, {
    method: 'DELETE',
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

export function atualizarQuantidadeItem(payload: {
  comandaId: number
  produtoId: number
  quantidade: number
}) {
  if (USE_MOCK) return MockAPI.atualizarQuantidadeItem(payload)
  return request(`/comandas/${payload.comandaId}/itens`, {
    method: 'PUT',
    body: JSON.stringify({ 
      produtoId: payload.produtoId,
      quantidade: payload.quantidade
    }),
  })
}

export function removerItemComanda(payload: {
  comandaId: number
  itemId: number
}) {
  if (USE_MOCK) return MockAPI.removerItemComanda(payload)
  return request(`/comandas/${payload.comandaId}/itens/${payload.itemId}`, {
    method: 'DELETE',
  })
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
