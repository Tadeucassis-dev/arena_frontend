import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Heading,
  Text,
  Divider,
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react'

type ComandaResumo = {
  id: number
  nomeCliente: string
  valorTotal: number | null
}

type AbrirComandaPayload = {
  nomeCliente: string
  tipoCliente: string
  valorDayUse: number | null
}

type ComandaControlProps = {
  comandaId: number | null
  onAbrirComanda: (payload: AbrirComandaPayload) => Promise<any>
  onSelecionar: (id: number) => void
  onFecharComanda: (id: number) => Promise<any>
  onBuscarLista: (nome: string) => Promise<ComandaResumo[]>
  onListarAbertas: () => Promise<ComandaResumo[]>
}

export default function ComandaControl({
  onAbrirComanda,
  onSelecionar,
  comandaId,
  onFecharComanda,
  onBuscarLista,
  onListarAbertas,
}: ComandaControlProps) {
  const [nomeCliente, setNomeCliente] = useState('')
  const [tipoCliente, setTipoCliente] = useState<'ALUNO' | 'DAY_USE'>('ALUNO')
  const [valorDayUse, setValorDayUse] = useState('')
  const [buscarNome, setBuscarNome] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [resultados, setResultados] = useState<ComandaResumo[]>([])
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null)

  function fmtMoney(v: number | null): string {
    if (v == null) return 'R$ 0,00'
    return v.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  async function abrir(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    setErr('')

    try {
      const payload: AbrirComandaPayload = {
        nomeCliente: nomeCliente.trim(),
        tipoCliente,
        valorDayUse: valorDayUse === '' ? null : Number(valorDayUse),
      }

      const opened = await onAbrirComanda(payload)
      setMsg(`Comanda aberta: #${opened.id}`)
      onSelecionar(opened.id)

      setNomeCliente('')
      setValorDayUse('')
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : 'Falha ao abrir comanda')
    }
  }

  async function buscarPorNome(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    setErr('')

    if (!buscarNome.trim()) {
      setErr('Informe o nome do cliente')
      return
    }

    try {
      const lista = await onBuscarLista(buscarNome.trim())
      setResultados(lista)

      if (lista.length === 1) {
        onSelecionar(lista[0].id)
        setMsg(`Comanda selecionada: ${lista[0].nomeCliente}`)
      } else if (lista.length === 0) {
        setErr('Nenhuma comanda encontrada')
      } else {
        setMsg(`${lista.length} comandas encontradas`)
      }
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : 'Falha ao buscar')
    }
  }

  async function fecharAtual() {
    setMsg('')
    setErr('')

    if (!comandaId) {
      setErr('Nenhuma comanda selecionada')
      return
    }

    try {
      const c = await onFecharComanda(comandaId)
      setMsg(`Comanda fechada: #${c.id}`)
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : 'Falha ao fechar comanda')
    }
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      <Heading size="md" mb={4}>
        Controle de Comandas
      </Heading>

      <Stack spacing={5}>
        {/* Abrir */}
        <Box as="form" onSubmit={abrir}>
          <Stack spacing={3}>
            <FormControl>
              <FormLabel>Nome do Cliente</FormLabel>
              <Input value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel>Tipo do Cliente</FormLabel>
              <Select value={tipoCliente} onChange={e => setTipoCliente(e.target.value as any)}>
                <option value="ALUNO">Aluno</option>
                <option value="DAY_USE">Day Use</option>
              </Select>
            </FormControl>

            {tipoCliente === 'DAY_USE' && (
              <FormControl>
                <FormLabel>Valor Day Use</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={valorDayUse}
                  onChange={e => setValorDayUse(e.target.value)}
                />
              </FormControl>
            )}

            <Button colorScheme="green" type="submit">
              Abrir Comanda
            </Button>
          </Stack>
        </Box>

        <Divider />

        {/* Buscar */}
        <Box as="form" onSubmit={buscarPorNome}>
          <Stack spacing={3}>
            <FormControl>
              <FormLabel>Buscar por Nome</FormLabel>
              <Input value={buscarNome} onChange={e => setBuscarNome(e.target.value)} />
            </FormControl>

            <Button colorScheme="blue" type="submit">
              Buscar
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                const lista = await onListarAbertas()
                setResultados(lista)
              }}
            >
              Listar Comandas Abertas
            </Button>
          </Stack>
        </Box>

        {/* Resultados */}
        {resultados.length > 1 && (
          <FormControl>
            <FormLabel>Resultados</FormLabel>
            <Select
              value={selecionadoId ?? ''}
              onChange={e => {
                const id = Number(e.target.value)
                setSelecionadoId(id)
                onSelecionar(id)
              }}
            >
              <option value="">Selecione...</option>
              {resultados.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nomeCliente} • #{r.id} • {fmtMoney(r.valorTotal)}
                </option>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Atual */}
        <Box display="flex" alignItems="center" gap={3}>
          <Text>
            Atual:{' '}
            {comandaId ? (
              <Badge colorScheme="green">#{comandaId}</Badge>
            ) : (
              <Badge colorScheme="gray">Nenhuma</Badge>
            )}
          </Text>
          <Button colorScheme="red" onClick={fecharAtual}>
            Fechar Comanda
          </Button>
        </Box>

        {msg && (
          <Alert status="success">
            <AlertIcon />
            {msg}
          </Alert>
        )}

        {err && (
          <Alert status="error">
            <AlertIcon />
            {err}
          </Alert>
        )}
      </Stack>
    </Box>
  )
}
