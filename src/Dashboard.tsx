import { useEffect, useState } from 'react'
import {
  Box,
  Alert,
  AlertIcon,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Heading,
  Text,
  Icon,
  Card,
  CardBody,
  Stack,
  Progress,
  Spinner,
  useToast
} from '@chakra-ui/react'
import { FiDollarSign, FiUsers, FiShoppingBag, FiActivity } from 'react-icons/fi'
import { listarComandas, getProdutos, getErrorMessage } from './api'
import { Comanda } from './types/comanda'
import { Produto } from './types/produtos'

type PeriodoFaturamento = 'hoje' | 'semana' | 'mes' | 'ano'

export default function Dashboard() {
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [periodo, setPeriodo] = useState<PeriodoFaturamento>('hoje')
  const toast = useToast()

  const bgCard = 'dark.800'
  const textColor = 'gray.300'

  async function loadData(showToast = false) {
    setLoading(true)
    setErr('')
    try {
      const [cmds, prods] = await Promise.all([
        listarComandas(),
        getProdutos()
      ])
      setComandas(cmds)
      setProdutos(prods)

      if (showToast) {
        toast({
          title: 'Dashboard atualizado',
          description: 'Os indicadores foram recarregados com sucesso',
          status: 'success',
          isClosable: true,
          duration: 2000,
        })
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Erro ao carregar dashboard')
      setErr(message)
      toast({
        title: 'Erro ao carregar dashboard',
        description: message,
        status: 'error',
        isClosable: true,
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function getValorComanda(comanda: Comanda & { total?: number }) {
    return Number(comanda.valorTotal ?? comanda.total ?? 0)
  }

  function isComandaAberta(comanda: Comanda & { dataFechamento?: string | null }) {
    if (comanda.status) {
      return comanda.status === 'ABERTA'
    }
    return !comanda.dataFechamento
  }

  function formatarHora(data?: string) {
    if (!data) return '--:--'

    const alvo = new Date(data)
    if (Number.isNaN(alvo.getTime())) return '--:--'

    return alvo.toLocaleTimeString()
  }

  function isNoPeriodo(data?: string, filtro?: PeriodoFaturamento) {
    if (!data || !filtro) return false

    const alvo = new Date(data)
    if (Number.isNaN(alvo.getTime())) return false

    const agora = new Date()
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())

    if (filtro === 'hoje') {
      return alvo >= inicioHoje
    }

    if (filtro === 'semana') {
      const inicioSemana = new Date(inicioHoje)
      inicioSemana.setDate(inicioHoje.getDate() - inicioHoje.getDay())
      return alvo >= inicioSemana
    }

    if (filtro === 'mes') {
      return alvo.getMonth() === agora.getMonth() && alvo.getFullYear() === agora.getFullYear()
    }

    return alvo.getFullYear() === agora.getFullYear()
  }

  const comandasAbertas = comandas.filter(isComandaAberta)
  const valorEmAberto = comandasAbertas.reduce((acc, curr) => acc + getValorComanda(curr), 0)
  const comandasFechadas = comandas.filter(c => !isComandaAberta(c))
  const faturamentoPeriodo = comandasFechadas
    .filter(c => isNoPeriodo(c.dataFechamento ?? c.dataAbertura, periodo))
    .reduce((acc, curr) => acc + getValorComanda(curr), 0)

  const estoqueBaixo = produtos.filter(p => p.estoque < 5).length
  const titulosPeriodo: Record<PeriodoFaturamento, string> = {
    hoje: 'Faturamento Hoje',
    semana: 'Faturamento Semanal',
    mes: 'Faturamento Mensal',
    ano: 'Faturamento Anual'
  }

  const CardStats = ({ title, value, icon, color, helpText }: any) => (
    <Card bg={bgCard} shadow="sm" border="1px solid" borderColor="dark.700">
      <CardBody>
        <Stat>
          <Flex align="center" justify="space-between">
            <Box>
              <StatLabel color={textColor}>{title}</StatLabel>
              <StatNumber fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="white">{value}</StatNumber>
              {helpText && <StatHelpText mb={0} color="gray.300">{helpText}</StatHelpText>}
            </Box>
            <Box p={3} bg={`${color}.900`} borderRadius="lg" border="1px solid" borderColor={`${color}.700`}>
              <Icon as={icon} w={6} h={6} color={`${color}.400`} />
            </Box>
          </Flex>
        </Stat>
      </CardBody>
    </Card>
  )

  return (
    <Box>
      <Flex mb={6} justify="space-between" align={{ base: 'start', md: 'center' }} gap={4} wrap="wrap">
        <Heading size="lg">Visão Geral</Heading>

        <Stack
          direction={{ base: 'column', sm: 'row' }}
          spacing={2}
          w={{ base: '100%', md: 'auto' }}
        >
          <Button
            onClick={() => setPeriodo('hoje')}
            bg={periodo === 'hoje' ? 'brand.500' : 'whiteAlpha.100'}
            color={periodo === 'hoje' ? 'black' : 'white'}
            borderColor={periodo === 'hoje' ? 'brand.500' : 'whiteAlpha.300'}
            _hover={{ bg: periodo === 'hoje' ? 'brand.400' : 'whiteAlpha.200' }}
            w={{ base: '100%', sm: 'auto' }}
          >
            Hoje
          </Button>
          <Button
            onClick={() => setPeriodo('semana')}
            bg={periodo === 'semana' ? 'brand.500' : 'whiteAlpha.100'}
            color={periodo === 'semana' ? 'black' : 'white'}
            borderColor={periodo === 'semana' ? 'brand.500' : 'whiteAlpha.300'}
            _hover={{ bg: periodo === 'semana' ? 'brand.400' : 'whiteAlpha.200' }}
            w={{ base: '100%', sm: 'auto' }}
          >
            Semanal
          </Button>
          <Button
            onClick={() => setPeriodo('mes')}
            bg={periodo === 'mes' ? 'brand.500' : 'whiteAlpha.100'}
            color={periodo === 'mes' ? 'black' : 'white'}
            borderColor={periodo === 'mes' ? 'brand.500' : 'whiteAlpha.300'}
            _hover={{ bg: periodo === 'mes' ? 'brand.400' : 'whiteAlpha.200' }}
            w={{ base: '100%', sm: 'auto' }}
          >
            Mensal
          </Button>
          <Button
            onClick={() => setPeriodo('ano')}
            bg={periodo === 'ano' ? 'brand.500' : 'whiteAlpha.100'}
            color={periodo === 'ano' ? 'black' : 'white'}
            borderColor={periodo === 'ano' ? 'brand.500' : 'whiteAlpha.300'}
            _hover={{ bg: periodo === 'ano' ? 'brand.400' : 'whiteAlpha.200' }}
            w={{ base: '100%', sm: 'auto' }}
          >
            Anual
          </Button>
        </Stack>
        <Button
          variant="outline"
          bg="whiteAlpha.100"
          borderColor="whiteAlpha.300"
          color="white"
          _hover={{ bg: 'whiteAlpha.200', borderColor: 'whiteAlpha.400' }}
          isLoading={loading}
          onClick={() => loadData(true)}
          w={{ base: '100%', md: 'auto' }}
        >
          Atualizar
        </Button>
      </Flex>

      {loading && (
        <Flex justify="center" align="center" gap={3} py={8}>
          <Spinner color="brand.500" thickness="3px" />
          <Text color="gray.300">Carregando dashboard...</Text>
        </Flex>
      )}

      {err && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {err}
        </Alert>
      )}
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 5 }} spacing={6} mb={8}>
        <CardStats 
          title={titulosPeriodo[periodo]}
          value={`R$ ${faturamentoPeriodo.toFixed(2)}`}
          icon={FiDollarSign} 
          color="green"
          helpText={<Flex align="center"><StatArrow type="increase" /> Comandas fechadas</Flex>}
        />
        <CardStats
          title="Faturamento em Aberto"
          value={`R$ ${valorEmAberto.toFixed(2)}`}
          icon={FiDollarSign}
          color="yellow"
          helpText={`${comandasAbertas.length} comandas pendentes`}
        />
        <CardStats 
          title="Comandas Abertas" 
          value={comandasAbertas.length} 
          icon={FiUsers} 
          color="blue"
          helpText="Aguardando fechamento"
        />
        <CardStats 
          title="Produtos Totais" 
          value={produtos.length} 
          icon={FiShoppingBag} 
          color="purple"
        />
        <CardStats 
          title="Estoque Baixo" 
          value={estoqueBaixo} 
          icon={FiActivity} 
          color="red"
          helpText={`${estoqueBaixo} itens precisam de atenção`}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Card bg={bgCard}>
          <CardBody>
            <Heading size="md" mb={4} color="white">Atividade Recente</Heading>
            <Stack spacing={4}>
              {comandas.slice(0, 5).map((comanda) => (
                <Flex key={comanda.id} justify="space-between" align="center" borderBottom="1px solid" borderColor="dark.700" pb={2}>
                  <Box>
                    <Text fontWeight="bold" color="white">{comanda.nomeCliente}</Text>
                    <Text fontSize="sm" color="gray.300">
                      {formatarHora(comanda.dataAbertura)} - {comanda.tipoCliente}
                    </Text>
                  </Box>
                  <Text fontWeight="bold" color={comanda.dataFechamento ? "green.500" : "blue.500"}>
                    {comanda.dataFechamento ? "Fechada" : "Aberta"}
                  </Text>
                </Flex>
              ))}
            </Stack>
          </CardBody>
        </Card>

        <Card bg={bgCard}>
          <CardBody>
            <Heading size="md" mb={4} color="white">Produtos (Estoque)</Heading>
            <Stack spacing={4}>
              {produtos.slice(0, 5).map(p => (
                <Box key={p.id}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontWeight="medium" color="white">{p.nome}</Text>
                    <Text color="gray.300">{p.estoque} un</Text>
                  </Flex>
                  <Progress value={p.estoque} max={50} colorScheme="brand" size="sm" borderRadius="full" bg="dark.700" />
                </Box>
              ))}
            </Stack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  )
}
