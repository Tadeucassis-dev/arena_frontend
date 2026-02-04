export type ItemComanda = {
  id?: number
  produtoId: number
  quantidade: number
  produto?: {
    nome: string
  }
}

export type Comanda = {
  id: number
  nomeCliente?: string
  tipoCliente?: 'ALUNO' | 'DAY_USE'
  status?: 'ABERTA' | 'FECHADA'
  valorDayUse?: number | null
  valorTotal?: number
  dataAbertura?: string
}
