import { useEffect, useState, useRef } from 'react'
import {
  Box,
  Heading,
  Flex,
  Select,
  Input,
  Button,
  Badge,
  Stack,
  Text,
  SimpleGrid,
  Image,
  FormControl,
  FormLabel,
  useColorModeValue,
  Icon,
  InputGroup,
  InputLeftElement,
  Spacer
} from '@chakra-ui/react'
import { FiSearch, FiPlus, FiUser, FiDollarSign } from 'react-icons/fi'
import { listarComandas, getItensComanda } from './api'
import Logo from './assets/logoPreta.png'

/* ===================== TIPOS ===================== */

type Status = '' | 'ABERTA' | 'FECHADA'

type Produto = {
  id: number
  nome: string
}

type Item = {
  id?: number
  produtoId?: number
  quantidade?: number
  produto?: { nome?: string }
}

type Comanda = {
  id: number
  nomeCliente?: string
  tipoCliente?: 'ALUNO' | 'DAY_USE'
  status?: 'ABERTA' | 'FECHADA'
  valorDayUse?: number | null
  valorTotal?: number
  dataAbertura?: string
}

/* ===================== PROPS ===================== */

interface Props {
  onSelecionar: (id: number) => void
  onFecharComanda: (id: number) => Promise<void> | void
  onAbrirComanda: (payload: {
    nomeCliente: string
    tipoCliente: 'ALUNO' | 'DAY_USE'
    valorDayUse: number | null
  }) => Promise<{ id: number }> | { id: number }
  produtos: Produto[]
}

/* ===================== COMPONENTE ===================== */

export default function ComandaList({
  onSelecionar,
  onFecharComanda,
  onAbrirComanda,
  produtos
}: Props) {
  const [status, setStatus] = useState<Status>('ABERTA')
  const [busca, setBusca] = useState('')
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const [openNome, setOpenNome] = useState('')
  const [openTipo, setOpenTipo] = useState<'ALUNO' | 'DAY_USE'>('ALUNO')
  const [openValor, setOpenValor] = useState('')

  const buscaRef = useRef<HTMLInputElement>(null)

  const [resumo, setResumo] = useState({
    faturamento: 0,
    count: 0,
    ticketMedio: 0
  })

  const [itensPorComanda, setItensPorComanda] = useState<
    Record<number, Item[]>
  >({})

  /* ===================== HELPERS ===================== */

  function fmtMoney(v?: number | null) {
    if (v == null) return 'R$ 0,00'
    return Number(v).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  function fmtDate(dt?: string) {
    if (!dt) return '-'
    const d = new Date(dt)
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('pt-BR')
  }

  function nomeProduto(pid?: number) {
    const p = produtos.find(p => p.id === pid)
    return p ? p.nome : `Produto #${pid ?? '-'}`
  }

  /* ===================== LOAD ===================== */

  async function load() {
    setLoading(true)
    setErr('')
    setMsg('')

    try {
      const data: Comanda[] = await listarComandas(status || undefined)
      setComandas(data || [])
      setMsg(`${data.length} comandas carregadas`)

      if (status === 'ABERTA') {
        const results: Item[][] = await Promise.all(
          data.map(c =>
            getItensComanda(c.id).catch(() => [])
          )
        )

        const map: Record<number, Item[]> = {}

        data.forEach((c, i) => {
          map[c.id] = results[i] ?? []
        })

        setItensPorComanda(map)
      } else {
        setItensPorComanda({})
      }
    } catch (e) {
      const error = e as Error
      setErr(error.message || 'Falha ao listar comandas')
    } finally {
      setLoading(false)
    }
  }

  async function loadResumo() {
    try {
      const fechadas: Comanda[] = await listarComandas('FECHADA')
      const total = fechadas.reduce(
        (s, c) => s + Number(c.valorTotal || 0),
        0
      )
      const count = fechadas.length
      setResumo({
        faturamento: total,
        count,
        ticketMedio: count ? total / count : 0
      })
    } catch {}
  }

  /* ===================== ACTIONS ===================== */

  async function fechar(id: number) {
    try {
      await onFecharComanda(id)
      setMsg(`Comanda fechada: #${id}`)
      await load()
    } catch (e) {
      const error = e as Error
      setErr(error.message || 'Erro ao fechar comanda')
    }
  }

  async function abrirNaLista() {
    try {
      if (!openNome.trim()) throw new Error('Informe o nome do cliente')

      const payload = {
        nomeCliente: openNome.trim(),
        tipoCliente: openTipo,
        valorDayUse: openValor === '' ? null : Number(openValor)
      }

      const c = await onAbrirComanda(payload)
      setMsg(`Comanda aberta: #${c.id}`)
      onSelecionar(c.id)
      setOpenNome('')
      setOpenValor('')
      await load()
    } catch (e) {
      const error = e as Error
      setErr(error.message || 'Erro ao abrir comanda')
    }
  }

  /* ===================== EFFECTS ===================== */

  useEffect(() => {
    load()
  }, [status])

  useEffect(() => {
    loadResumo()
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault()
        buscaRef.current?.focus()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  /* ===================== FILTRO ===================== */

  const filtradas = comandas.filter(c =>
    (c.nomeCliente || '').toLowerCase().includes(busca.toLowerCase()) ||
    String(c.id).includes(busca)
  )

  /* ===================== RENDER ===================== */

  const cardBg = 'dark.800'
  const cardBorder = 'dark.700'
  const brandColor = 'brand.500'

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      {/* HEADER & LOGO */}
      <Flex direction="column" align="center" mb={8}>
        <Image 
          src={Logo} 
          alt="Arena Cesar" 
          h="120px" 
          objectFit="contain" 
          mb={4} 
          borderRadius="md"
          mixBlendMode="screen"
        />
        <Heading size="lg" color={brandColor} textTransform="uppercase" letterSpacing="wide">
          Gestão de Comandas
        </Heading>
      </Flex>

      {/* NOVA COMANDA CARD */}
      <Box 
        bg={cardBg} 
        p={6} 
        borderRadius="xl" 
        border="1px solid" 
        borderColor={cardBorder}
        boxShadow="lg"
        mb={8}
      >
        <Flex align="center" mb={4}>
          <Icon as={FiPlus} color={brandColor} w={6} h={6} mr={2} />
          <Heading size="md">Abrir Nova Comanda</Heading>
        </Flex>
        
        <Flex gap={4} wrap="wrap" align="flex-end">
          <FormControl maxW={{ base: '100%', md: '300px' }}>
            <FormLabel>Nome do Cliente</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none"><FiUser color="gray.500" /></InputLeftElement>
              <Input
                placeholder="Ex: João Silva"
                value={openNome}
                onChange={e => setOpenNome(e.target.value)}
                bg="dark.900"
                borderColor="dark.700"
              />
            </InputGroup>
          </FormControl>

          <FormControl maxW={{ base: '100%', md: '200px' }}>
            <FormLabel>Tipo</FormLabel>
            <Select
              value={openTipo}
              onChange={e => setOpenTipo(e.target.value as any)}
              bg="dark.900"
              borderColor="dark.700"
            >
              <option value="ALUNO">Aluno</option>
              <option value="DAY_USE">Day Use</option>
            </Select>
          </FormControl>

          {openTipo === 'DAY_USE' && (
            <FormControl maxW={{ base: '100%', md: '150px' }}>
              <FormLabel>Valor (R$)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none"><FiDollarSign color="gray.500" /></InputLeftElement>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={openValor}
                  onChange={e => setOpenValor(e.target.value)}
                  bg="dark.900"
                  borderColor="dark.700"
                />
              </InputGroup>
            </FormControl>
          )}

          <Button 
            onClick={abrirNaLista} 
            colorScheme="brand" 
            bg={brandColor} 
            color="black"
            px={8}
            isLoading={loading}
          >
            Abrir Comanda
          </Button>
        </Flex>
      </Box>

      {/* CONTROLS & STATS */}
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'stretch', md: 'center' }}
        mb={6}
        gap={4}
      >
        <Flex gap={3} flex={1}>
          <Select
            maxW="150px"
            value={status}
            onChange={e => setStatus(e.target.value as Status)}
            bg="dark.800"
            borderColor="dark.700"
          >
            <option value="">Todas</option>
            <option value="ABERTA">Abertas</option>
            <option value="FECHADA">Fechadas</option>
          </Select>

          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none"><FiSearch color="gray.500" /></InputLeftElement>
            <Input
              ref={buscaRef}
              placeholder="Buscar comanda..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              bg="dark.800"
              borderColor="dark.700"
            />
          </InputGroup>
          
          <Button onClick={load} isLoading={loading} variant="ghost">
            Atualizar
          </Button>
        </Flex>

        <Flex gap={6} fontSize="sm" color="gray.400" display={{ base: 'none', lg: 'flex' }}>
          <Text>Fechadas: <Text as="span" color="white" fontWeight="bold">{resumo.count}</Text></Text>
          <Text>Faturamento: <Text as="span" color="green.400" fontWeight="bold">{fmtMoney(resumo.faturamento)}</Text></Text>
          <Text>Ticket Médio: <Text as="span" color="brand.400" fontWeight="bold">{fmtMoney(resumo.ticketMedio)}</Text></Text>
        </Flex>
      </Flex>

      {/* GRID DE COMANDAS */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
        {filtradas.map(c => {
          const itens = itensPorComanda[c.id] || []
          const isClosed = c.status === 'FECHADA'

          return (
            <Box
              key={c.id}
              bg={cardBg}
              borderRadius="2xl"
              border="1px solid"
              borderColor={isClosed ? 'transparent' : 'brand.500'}
              p={5}
              position="relative"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              role="group"
            >
              <Flex justify="space-between" align="start" mb={3}>
                <Badge 
                  colorScheme={isClosed ? 'gray' : 'green'} 
                  variant="solid" 
                  fontSize="0.7em"
                  px={2}
                  borderRadius="full"
                >
                  {c.status}
                </Badge>
                <Text fontWeight="bold" fontSize="2xl" color="gray.500" opacity={0.3}>
                  #{c.id}
                </Text>
              </Flex>

              <Text fontWeight="bold" fontSize="lg" noOfLines={1} mb={1}>
                {c.nomeCliente || 'Sem Nome'}
              </Text>
              
              <Flex align="center" gap={2} mb={4}>
                 <Badge variant="outline" colorScheme={c.tipoCliente === 'ALUNO' ? 'blue' : 'purple'}>
                    {c.tipoCliente}
                 </Badge>
                 <Text fontSize="xs" color="gray.500">
                    {fmtDate(c.dataAbertura)}
                 </Text>
              </Flex>

              <Box 
                bg="dark.900" 
                p={3} 
                borderRadius="md" 
                mb={4} 
                maxH="100px" 
                overflowY="auto"
                css={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: '#333', borderRadius: '4px' } }}
              >
                {c.status === 'ABERTA' && itens.length > 0 ? (
                  <Stack spacing={2}>
                    {itens.map((it, i) => (
                      <Flex key={`${c.id}-${i}`} justify="space-between" fontSize="xs">
                        <Text color="gray.300" noOfLines={1}>{it.produto?.nome || nomeProduto(it.produtoId)}</Text>
                        <Text color="brand.400" fontWeight="bold">x{it.quantidade}</Text>
                      </Flex>
                    ))}
                  </Stack>
                ) : (
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    {c.status === 'FECHADA' ? 'Comanda Finalizada' : 'Nenhum item adicionado'}
                  </Text>
                )}
              </Box>

              <Flex justify="space-between" align="center" mt="auto" pt={2} borderTop="1px solid" borderColor="dark.700">
                <Box>
                  <Text fontSize="xs" color="gray.500">Total</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.300">
                    {fmtMoney(c.valorTotal)}
                  </Text>
                </Box>
                
                <Button
                  size="sm"
                  colorScheme="brand"
                  variant="solid"
                  bg={brandColor}
                  color="black"
                  onClick={() => onSelecionar(c.id)}
                  _groupHover={{ bg: 'brand.400' }}
                >
                  Abrir
                </Button>
              </Flex>
            </Box>
          )
        })}
      </SimpleGrid>

      {filtradas.length === 0 && (
        <Flex direction="column" align="center" justify="center" p={10} bg={cardBg} borderRadius="xl">
            <Text fontSize="xl" color="gray.500">Nenhuma comanda encontrada.</Text>
            <Button mt={4} onClick={() => { setStatus(''); setBusca(''); }} variant="link" color="brand.400">
                Limpar filtros
            </Button>
        </Flex>
      )}

      {!!msg && <Box position="fixed" bottom={4} right={4} bg="green.500" p={3} borderRadius="md" color="white" boxShadow="lg">{msg}</Box>}
      {!!err && <Box position="fixed" bottom={4} right={4} bg="red.500" p={3} borderRadius="md" color="white" boxShadow="lg">{err}</Box>}
    </Box>
  )
}
