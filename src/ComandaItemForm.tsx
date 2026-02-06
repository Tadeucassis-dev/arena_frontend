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
import { FiPlus, FiMinus, FiShoppingCart, FiSearch } from 'react-icons/fi'
import { Produto } from './types/produtos'

interface Props {
  produtos: Produto[]
  selectedComandaId?: number | null
  onAddItem: (payload: { comandaId: number, produtoId: number, quantidade: number }) => Promise<any>
}

export function ComandaItemForm({ produtos, onAddItem, selectedComandaId }: Props) {
  const [loading, setLoading] = useState(false)
  const [quantidades, setQuantidades] = useState<Record<number, number>>({})
  const [busca, setBusca] = useState('')
  const toast = useToast()

  const produtosFiltrados = produtos
    .filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  const handleQuantityChange = (id: number, delta: number) => {
    setQuantidades(prev => {
      const current = prev[id] || 0
      const next = Math.max(0, current + delta)
      return { ...prev, [id]: next }
    })
  }

  async function handleAdd(produto: Produto) {
    if (!selectedComandaId) {
        toast({ title: 'Selecione uma comanda', status: 'error' })
        return
    }

    const qtd = quantidades[produto.id] || 1
    if (qtd <= 0) return

    setLoading(true)
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
        duration: 1000,
        isClosable: true,
      })
      // Reset quantidade
      setQuantidades(prev => ({ ...prev, [produto.id]: 0 }))
    } catch (err) {
      toast({
        title: 'Erro ao adicionar item',
        status: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Adicionar Produtos</Heading>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Buscar produto..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            bg="dark.800"
            borderColor="dark.700"
          />
        </InputGroup>
      </Flex>
      
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
        {produtosFiltrados.map(produto => {
          const qtd = quantidades[produto.id] || 0
          
          return (
            <Card 
              key={produto.id} 
              variant="outline" 
              _hover={{ borderColor: 'brand.500', shadow: 'md' }}
              transition="all 0.2s"
              cursor="pointer"
              onClick={() => !qtd && handleQuantityChange(produto.id, 1)}
            >
              <CardBody p={4}>
                <Flex justify="space-between" align="start" mb={2}>
                  <Badge colorScheme={produto.estoque > 0 ? 'green' : 'red'} variant="subtle" fontSize="0.6em">
                    {produto.estoque > 0 ? 'EM ESTOQUE' : 'ESGOTADO'}
                  </Badge>
                  <Text fontWeight="bold" color="brand.500">
                    R$ {Number(produto.preco).toFixed(2)}
                  </Text>
                </Flex>
                
                <Text fontWeight="bold" fontSize="md" mb={4} noOfLines={2} h="2.5em">
                  {produto.nome}
                </Text>

                {qtd > 0 ? (
                  <HStack justify="center">
                    <IconButton
                      icon={<FiMinus />}
                      aria-label="Diminuir"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleQuantityChange(produto.id, -1) }}
                    />
                    <Text fontWeight="bold" w="30px" textAlign="center">{qtd}</Text>
                    <IconButton
                      icon={<FiPlus />}
                      aria-label="Aumentar"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleQuantityChange(produto.id, 1) }}
                    />
                    <Button 
                      size="sm" 
                      bg="brand.500"
                      color="black"
                      _hover={{ bg: 'brand.400' }}
                      ml={2}
                      isLoading={loading}
                      onClick={(e) => { e.stopPropagation(); handleAdd(produto) }}
                    >
                      Add
                    </Button>
                  </HStack>
                ) : (
                  <Button 
                    w="full" 
                    size="sm" 
                    variant="ghost" 
                    colorScheme="gray"
                    leftIcon={<FiShoppingCart />}
                  >
                    Selecionar
                  </Button>
                )}
              </CardBody>
            </Card>
          )
        })}
      </SimpleGrid>
    </Box>
  )
}

export default ComandaItemForm