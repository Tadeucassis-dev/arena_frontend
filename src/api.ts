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

  if (res.status === 204) return null as T

  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) return null as T

  return (await res.json()) as T
}

/* ===================== MOCK IMPLEMENTATION ===================== */
// Mude para false para usar a API real
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
    produtos: [
      { id: 1, nome: 'Água 500ml', preco: 4.0, estoque: 48 },
      { id: 2, nome: 'Cerveja Heineken', preco: 12.0, estoque: 24 },
      { id: 3, nome: 'Refrigerante Lata', preco: 6.0, estoque: 30 },
      { id: 4, nome: 'Energético Monster', preco: 15.0, estoque: 10 },
      { id: 5, nome: 'Barra de Proteína', preco: 10.0, estoque: 15 },
    ],
    comandas: [
      { 
        id: 1, 
        nomeCliente: 'João da Silva', 
        tipoCliente: 'ALUNO', 
        status: 'ABERTA', 
        total: 0, 
        valorDayUse: null,
        itens: [] 
      },
      { 
        id: 2, 
        nomeCliente: 'Maria Oliveira', 
        tipoCliente: 'DAY_USE', 
        valorDayUse: 30, 
        status: 'ABERTA', 
        total: 30, 
        itens: [] 
      }
    ]
  }
}

let db = loadDb()

const saveDb = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms))

const MockAPI = {
  getProdutos: async () => { await delay(); return db.produtos },
  
  criarProduto: async (payload: any) => {
    await delay()
    const novo = { id: Date.now(), ...payload, estoque: Number(payload.estoque) || 0, preco: Number(payload.preco) || 0 }
    db.produtos.push(novo)
    saveDb()
    return novo
  },

  atualizarProduto: async (id: number, payload: any) => {
    await delay()
    const idx = db.produtos.findIndex((p: any) => p.id === Number(id))
    if (idx >= 0) {
       db.produtos[idx] = { ...db.produtos[idx], ...payload }
       saveDb()
       return db.produtos[idx]
    }
    throw new Error('Produto não encontrado')
  },

  abrirComanda: async (payload: any) => {
    await delay()
    const valorDayUse = payload.valorDayUse ? Number(payload.valorDayUse) : null
    const nova = {
       id: Date.now(),
       nomeCliente: payload.nomeCliente,
       tipoCliente: payload.tipoCliente,
       valorDayUse,
       status: 'ABERTA',
       total: valorDayUse || 0,
       itens: []
    }
    db.comandas.push(nova)
    saveDb()
    return nova
  },

  listarComandas: async (status?: string) => {
    await delay()
    if (status) return db.comandas.filter((c: any) => c.status === status)
    return db.comandas
  },

  getComanda: async (id: number) => {
    await delay()
    const c = db.comandas.find((x: any) => x.id === Number(id))
    if (!c) throw new Error('Comanda não encontrada')
    return c
  },

  fecharComanda: async (id: number) => {
    await delay()
    const c = db.comandas.find((x: any) => x.id === Number(id))
    if (c) {
      c.status = 'FECHADA'
      saveDb()
      return c
    }
    throw new Error('Erro ao fechar')
  },

  atualizarComanda: async (id: number, payload: any) => {
     await delay()
     const c = db.comandas.find((x: any) => x.id === Number(id))
     if(c) {
        // Se estiver atualizando day use, recalcula total
        if (payload.valorDayUse !== undefined && c.tipoCliente === 'DAY_USE') {
           const oldDayUse = c.valorDayUse || 0
           const newDayUse = Number(payload.valorDayUse)
           c.total = (c.total - oldDayUse) + newDayUse
        }
        Object.assign(c, payload)
        saveDb()
        return c
     }
     throw new Error('Erro ao atualizar')
  },

  deletarComanda: async (id: number) => {
    await delay()
    db.comandas = db.comandas.filter((c: any) => c.id !== Number(id))
    saveDb()
    return true
  },

  adicionarItemComanda: async (payload: any) => {
    await delay()
    const { comandaId, produtoId, quantidade } = payload
    const comanda = db.comandas.find((c: any) => c.id === Number(comandaId))
    const produto = db.produtos.find((p: any) => p.id === Number(produtoId))
    
    if (comanda && produto) {
       const item = {
         id: Date.now() + Math.random(),
         produtoId,
         quantidade,
         nomeProduto: produto.nome,
         precoUnitario: produto.preco
       }
       comanda.itens = comanda.itens || []
       comanda.itens.push(item)
       
       // Atualizar total
       comanda.total = (comanda.total || 0) + (produto.preco * quantidade)
       
       // Baixar estoque
       produto.estoque -= quantidade
       
       saveDb()
       return item
    }
    throw new Error('Erro ao adicionar item')
  },
  
  getItensComanda: async (comandaId: number) => {
      await delay()
      const c = db.comandas.find((x: any) => x.id === Number(comandaId))
      return c ? (c.itens || []) : []
  }
}
/* ===================== END MOCK ===================== */

/* ===================== PRODUTOS ===================== */

export function getProdutos() {
  if (USE_MOCK) return MockAPI.getProdutos()
  return request('/produtos')
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

export function listarComandas(
  status?: 'ABERTA' | 'FECHADA'
) {
  if (USE_MOCK) return MockAPI.listarComandas(status)
  const query = status ? `?status=${status}` : ''
  return request(`/comandas${query}`)
}

export function getComanda(id: number) {
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

export function getItensComanda(comandaId: number) {
  if (USE_MOCK) return MockAPI.getItensComanda(comandaId)
  return request(`/comandas/${comandaId}/itens`)
}

/* ===================== BUSCAS ===================== */

export async function buscarComandasPorNome(
  nomeCliente: string,
  status: 'ABERTA' | 'FECHADA' = 'ABERTA'
) {
  const lista = await listarComandas(status)
  const termo = nomeCliente.toLowerCase()

  return lista.filter((c: any) =>
    (c.nomeCliente || '').toLowerCase().includes(termo)
  )
}

export async function buscarComandaPorNome(nomeCliente: string) {
  const lista = await listarComandas()
  const termo = nomeCliente.toLowerCase()

  const match = lista.find((c: any) =>
    (c.nomeCliente || '').toLowerCase().includes(termo)
  )

  if (!match) {
    throw new Error('Comanda não encontrada pelo nome')
  }

  return match
}
