import { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  Badge,
  IconButton,
  HStack
} from '@chakra-ui/react'
import { FiPlus, FiMinus, FiSearch } from 'react-icons/fi'
import { Produto } from './types/produtos'
import { getErrorMessage } from './api'

interface Props {
  produtos: Produto[]
  selectedComandaId?: number | null
  onAddItem: (payload: { comandaId: number, produtoId: number, quantidade: number }) => Promise<any>
}

export function ComandaItemForm({ produtos, onAddItem, selectedComandaId }: Props) {
  const [produtoEmEnvio, setProdutoEmEnvio] = useState<number | null>(null)
  const [quantidades, setQuantidades] = useState<Record<number, number>>({})
  const [busca, setBusca] = useState('')
  const toast = useToast()

  const normalizeText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
  }

  const produtosFiltrados = produtos
    .filter(p => normalizeText(p.nome).includes(normalizeText(busca)))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  const handleQuantityChange = (id: number, delta: number) => {
    const produto = produtos.find(item => item.id === id)
    const estoqueDisponivel = produto?.estoque ?? 0

    setQuantidades(prev => {
      const current = prev[id] || 1
      const next = Math.max(1, current + delta)

      if (delta > 0 && next > estoqueDisponivel) {
        toast({
          title: 'Estoque limite atingido',
          description: `Disponivel: ${estoqueDisponivel} unidade(s) de ${produto?.nome || 'produto'}`,
          status: 'warning',
          duration: 2500,
          isClosable: true,
        })
        return prev
      }

      return { ...prev, [id]: next }
    })
  }

  async function handleAdd(produto: Produto) {
    if (produtoEmEnvio === produto.id) return

    if (!selectedComandaId) {
        toast({ title: 'Selecione uma comanda', status: 'error' })
        return
    }

    const qtd = quantidades[produto.id] || 1
    if (qtd <= 0) return
    if (qtd > (produto.estoque ?? 0)) {
      toast({
        title: 'Quantidade acima do estoque',
        description: `Disponivel: ${produto.estoque ?? 0} unidade(s)`,
        status: 'warning',
        duration: 2500,
        isClosable: true,
      })
      return
    }

    setProdutoEmEnvio(produto.id)
    try {
      await onAddItem({
          comandaId: selectedComandaId,
          produtoId: produto.id,
          quantidade: qtd
      })
      
      toast({
        title: 'Item adicionado',
        description: `${qtd}x ${produto.nome}`,
        status: 'success',
        duration: 1500,
        isClosable: true,
      })
      // Reset quantidade
      setQuantidades(prev => ({ ...prev, [produto.id]: 1 }))
    } catch (err) {
      toast({
        title: 'Erro ao adicionar item',
        description: getErrorMessage(err, 'Nao foi possivel adicionar o item'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setProdutoEmEnvio(null)
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Adicionar Produtos</Heading>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="rgb(209, 213, 219)" />
          </InputLeftElement>
          <Input
            placeholder="Buscar produto..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            bg="dark.800"
            borderColor="dark.700"
            color="white"
            _placeholder={{ color: 'gray.300' }}
          />
        </InputGroup>
      </Flex>
      
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
        {produtosFiltrados.map(produto => {
          const qtd = quantidades[produto.id] || 1
          
          return (
            <Card 
              key={produto.id} 
              variant="outline" 
              _hover={{ borderColor: 'brand.500', shadow: 'md' }}
              transition="all 0.2s"
            >
              <CardBody p={4} display="flex" flexDirection="column" h="full">
                <Flex justify="space-between" align="start" mb={2}>
                  <Badge colorScheme={produto.estoque > 0 ? 'green' : 'red'} variant="subtle" fontSize="0.6em">
                    {produto.estoque > 0 ? 'EM ESTOQUE' : 'ESGOTADO'}
                  </Badge>
                  <Text fontWeight="bold" color="brand.500">
                    R$ {Number(produto.preco).toFixed(2)}
                  </Text>
                </Flex>

                <Text fontWeight="bold" fontSize="md" mb={4} noOfLines={3} minH="4.2em">
                  {produto.nome}
                </Text>

                <Text fontSize="xs" color="gray.300" mb={3}>
                  Disponivel: {produto.estoque} unidade(s)
                </Text>

                <HStack justify="center" mb={3}>
                  <IconButton
                    icon={<FiMinus />}
                    aria-label="Diminuir"
                    size="sm"
                    onClick={() => handleQuantityChange(produto.id, -1)}
                    isDisabled={qtd <= 1 || produtoEmEnvio !== null}
                  />
                  <Text fontWeight="bold" w="30px" textAlign="center">{qtd}</Text>
                  <IconButton
                    icon={<FiPlus />}
                    aria-label="Aumentar"
                    size="sm"
                    onClick={() => handleQuantityChange(produto.id, 1)}
                    isDisabled={produto.estoque <= 0 || qtd >= produto.estoque || produtoEmEnvio !== null}
                  />
                </HStack>

                <Button
                  size="sm"
                  w="full"
                  mt="auto"
                  bg="brand.500"
                  color="black"
                  _hover={{ bg: 'brand.400' }}
                  isLoading={produtoEmEnvio === produto.id}
                  onClick={() => handleAdd(produto)}
                  isDisabled={produto.estoque <= 0 || produtoEmEnvio !== null}
                >
                  Adicionar
                </Button>
              </CardBody>
            </Card>
          )
        })}
      </SimpleGrid>
    </Box>
  )
}

export default ComandaItemForm
