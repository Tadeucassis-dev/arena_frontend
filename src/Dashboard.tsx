import { useEffect, useState } from 'react'
import {
  Box,
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
  useColorModeValue
} from '@chakra-ui/react'
import { FiDollarSign, FiUsers, FiShoppingBag, FiActivity } from 'react-icons/fi'
import { listarComandas, getProdutos } from './api'
import { Produto } from './types/produtos'

export default function Dashboard() {
  const [comandas, setComandas] = useState<any[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  const bgCard = 'dark.800'
  const textColor = 'gray.400'

  useEffect(() => {
    async function loadData() {
      try {
        const [cmds, prods] = await Promise.all([
          listarComandas(),
          getProdutos()
        ])
        setComandas(cmds)
        setProdutos(prods)
      } catch (error) {
        console.error("Erro ao carregar dashboard", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Cálculos
  const comandasAbertas = comandas.filter(c => c.dataFechamento === null)
  const totalVendasHoje = comandas
    .filter(c => {
      // Filtrar por data de hoje (simplificado)
      const dataComanda = new Date(c.dataAbertura).toDateString()
      const hoje = new Date().toDateString()
      return dataComanda === hoje
    })
    .reduce((acc, curr) => acc + curr.total, 0)

  const estoqueBaixo = produtos.filter(p => p.estoque < 5).length

  const CardStats = ({ title, value, icon, color, helpText }: any) => (
    <Card bg={bgCard} shadow="sm" border="1px solid" borderColor="dark.700">
      <CardBody>
        <Stat>
          <Flex align="center" justify="space-between">
            <Box>
              <StatLabel color={textColor}>{title}</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="bold" color="white">{value}</StatNumber>
              {helpText && <StatHelpText mb={0} color="gray.500">{helpText}</StatHelpText>}
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
      <Heading mb={6} size="lg">Visão Geral</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <CardStats 
          title="Faturamento Hoje" 
          value={`R$ ${totalVendasHoje.toFixed(2)}`} 
          icon={FiDollarSign} 
          color="green"
          helpText={<Flex align="center"><StatArrow type="increase" /> Estimado</Flex>}
        />
        <CardStats 
          title="Comandas Abertas" 
          value={comandasAbertas.length} 
          icon={FiUsers} 
          color="blue"
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
        <Card bg={bgCard} shadow="sm">
          <CardBody>
            <Heading size="md" mb={4}>Atividade Recente</Heading>
            <Stack spacing={4}>
              {comandas.slice(0, 5).map((comanda) => (
                <Flex key={comanda.id} justify="space-between" align="center" borderBottom="1px solid" borderColor="dark.700" pb={2}>
                  <Box>
                    <Text fontWeight="bold" color="white">{comanda.nomeCliente}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(comanda.dataAbertura).toLocaleTimeString()} - {comanda.tipoCliente}
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

        <Card bg={bgCard} shadow="sm">
          <CardBody>
            <Heading size="md" mb={4}>Top Produtos (Estoque)</Heading>
            <Stack spacing={4}>
              {produtos.slice(0, 5).map(p => (
                <Box key={p.id}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontWeight="medium" color="white">{p.nome}</Text>
                    <Text color="gray.500">{p.estoque} un</Text>
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