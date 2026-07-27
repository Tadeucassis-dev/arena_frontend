import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Stack,
  Badge,
  Divider,
  SimpleGrid,
  Alert,
  AlertIcon,
  useColorModeValue,
  Image,
  Icon,
  Spacer
} from '@chakra-ui/react'
import { FiArrowLeft, FiTrash2, FiCheckCircle, FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi'

import { ComandaItemForm } from './ComandaItemForm'
import Logo from './assets/logoPreta.png'
import { Produto } from './types/produtos'
import { atualizarQuantidadeItem } from './api'

type ItemComanda = {
  id: number
  produto: Produto
  quantidade: number
  subtotal: number
}

type Comanda = {
  id: number
  nomeCliente: string
  status: 'ABERTA' | 'FECHADA'
  valorTotal?: number
  itens: ItemComanda[]
}

type Props = {
  comandaId: number
  produtos: Produto[]
  onAddItem: (payload: {
    comandaId: number
    produtoId: number
    quantidade: number
  }) => Promise<any>
  onFecharComanda: (id: number) => Promise<any>
  onGetComanda: (id: number) => Promise<any>
  onDeletarComanda: (id: number) => Promise<void>
  onProdutosAtualizados?: () => Promise<void> | void
  onVoltar: () => void
}

export default function ComandaPage({
  comandaId,
  produtos,
  onAddItem,
  onFecharComanda,
  onGetComanda,
  onDeletarComanda,
  onProdutosAtualizados,
  onVoltar,
}: Props) {
  const [comanda, setComanda] = useState<Comanda | null>(null)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [atualizandoItem, setAtualizandoItem] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setErr('')
        const data = await onGetComanda(comandaId)
        setComanda(data)
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Erro ao carregar comanda')
      }
    }
    load()
  }, [comandaId])

  async function refresh() {
    const data = await onGetComanda(comandaId)
    setComanda(data)
    await onProdutosAtualizados?.()
  }

  async function handleFechar() {
    setLoading(true)
    try {
      await onFecharComanda(comandaId)
      setMsg('Comanda fechada com sucesso')
      await refresh()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Erro ao fechar comanda')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Deseja realmente excluir esta comanda?')) return
    await onDeletarComanda(comandaId)
  }

  async function handleAtualizarQuantidade(produtoId: number, novaQuantidade: number) {
    if (atualizandoItem === produtoId) return
    setAtualizandoItem(produtoId)
    try {
      await atualizarQuantidadeItem({
        comandaId,
        produtoId,
        quantidade: novaQuantidade
      })
      await refresh()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Erro ao atualizar quantidade')
    } finally {
      setAtualizandoItem(null)
    }
  }

  if (!comanda) {
    return <Text>Carregando comanda...</Text>
  }

  const bgCard = 'dark.800'
  const borderCard = 'dark.700'
  const brandColor = 'brand.500'

  return (
    <Box maxW="1200px" mx="auto" p={{ base: 2, md: 4 }}>
      {/* TOPO / HEADER */}
      <Flex 
        bg={bgCard} 
        p={4} 
        borderRadius="xl" 
        border="1px solid" 
        borderColor={borderCard} 
        mb={6} 
        justify="space-between" 
        align="center"
        wrap="wrap"
        gap={4}
      >
        <Flex align="center" gap={4}>
           <Image 
              src={Logo} 
              alt="Arena Cesar" 
              h="50px" 
              objectFit="contain" 
              borderRadius="md"
              mixBlendMode="screen"
            />
           <Box>
              <Heading size="md" color="white">
                Comanda #{comanda.id}
              </Heading>
              <Flex align="center" gap={2}>
                 <Text color="gray.300" fontSize="sm">Cliente:</Text>
                 <Text fontWeight="bold" fontSize="lg">{comanda.nomeCliente || '—'}</Text>
                 <Badge ml={2} colorScheme={comanda.status === 'ABERTA' ? 'green' : 'red'}>
                  {comanda.status}
                </Badge>
              </Flex>
           </Box>
        </Flex>

        <Stack
          direction={{ base: 'column', sm: 'row' }}
          spacing={3}
          w={{ base: '100%', md: 'auto' }}
          align="stretch"
        >
          <Button
            leftIcon={<FiArrowLeft />}
            onClick={onVoltar}
            variant="outline"
            bg="whiteAlpha.100"
            borderColor="whiteAlpha.300"
            color="white"
            _hover={{ bg: 'whiteAlpha.200', borderColor: 'whiteAlpha.400' }}
            w={{ base: '100%', sm: 'auto' }}
          >
            Voltar
          </Button>
          {comanda.status === 'ABERTA' && (
            <Button
              leftIcon={<FiCheckCircle />}
              colorScheme="brand"
              bg={brandColor}
              color="black"
              onClick={handleFechar}
              isLoading={loading}
              _hover={{ bg: 'brand.400' }}
              w={{ base: '100%', sm: 'auto' }}
            >
              Fechar Comanda
            </Button>
          )}
          <Button
            leftIcon={<FiTrash2 />}
            colorScheme="red"
            variant="outline"
            onClick={handleDelete}
            w={{ base: '100%', sm: 'auto' }}
          >
            Excluir
          </Button>
        </Stack>
      </Flex>

      {/* MENSAGENS */}
      {msg && (
        <Alert status="success" mb={4} borderRadius="md">
          <AlertIcon />
          {msg}
        </Alert>
      )}

      {err && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {err}
        </Alert>
      )}

      {/* CONTEÚDO PRINCIPAL - GRID RESPONSIVO */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
        
        {/* COLUNA ESQUERDA: GRID DE PRODUTOS (MAIOR) */}
        <Box gridColumn={{ lg: "span 2" }}>
           {comanda.status === 'FECHADA' ? (
            <Alert status="success" borderRadius="md" mb={6}>
              <AlertIcon />
              Comanda fechada
            </Alert>
          ) : (
            <Box mb={8}>
              <ComandaItemForm 
                  produtos={produtos} 
                  selectedComandaId={comanda.id}
                  onAddItem={async payload => {
                    const res = await onAddItem(payload)
                    await refresh()
                    return res
                  }}
               />
            </Box>
          )}
        </Box>

        {/* COLUNA DIREITA: RECIBO / CART (MENOR E STICKY) */}
        <Box>
           <Box 
            position="sticky" 
            top="100px" 
            bg={bgCard} 
            p={0} 
            borderRadius="xl" 
            border="1px solid" 
            borderColor={borderCard}
            overflow="hidden"
            display="flex"
            flexDirection="column"
            maxH="calc(100vh - 120px)"
          >
            <Box p={5} bg="dark.900" borderBottom="1px solid" borderColor={borderCard}>
               <Flex align="center" gap={2}>
                  <Icon as={FiShoppingCart} color={brandColor} />
                  <Heading size="md" color="white">Consumo</Heading>
                  <Spacer />
                  <Badge colorScheme="blue">{(comanda.itens || []).length}</Badge>
               </Flex>
            </Box>

            <Stack spacing={0} divider={<Divider borderColor="dark.700" />} overflowY="auto">
              {(comanda.itens || []).length === 0 && (
                <Box p={8} textAlign="center">
                   <Text color="gray.500">Nenhum item</Text>
                </Box>
              )}

              {(comanda.itens || []).map(item => (
                <Flex
                  key={item.id}
                  justify="space-between"
                  align="center"
                  p={4}
                  _hover={{ bg: 'dark.700' }}
                  transition="background 0.2s"
                >
                  <Box flex="1">
                    <Text fontWeight="bold" fontSize="md">{item.produto.nome}</Text>
                    <Text fontSize="sm" color="gray.300">
                      R$ {(item.produto.preco || 0).toFixed(2)} cada
                    </Text>
                  </Box>

                  {/* Controles de quantidade */}
                  {comanda.status === 'ABERTA' && (
                    <Flex align="center" gap={2} mr={4}>
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => handleAtualizarQuantidade(item.produto.id, item.quantidade - 1)}
                        isLoading={atualizandoItem === item.produto.id}
                        disabled={atualizandoItem === item.produto.id}
                      >
                        <Icon as={FiMinus} />
                      </Button>
                      <Badge minW="40px" textAlign="center" fontSize="md" colorScheme="brand">
                        {item.quantidade}
                      </Badge>
                      <Button
                        size="xs"
                        colorScheme="green"
                        variant="outline"
                        onClick={() => handleAtualizarQuantidade(item.produto.id, item.quantidade + 1)}
                        isLoading={atualizandoItem === item.produto.id}
                        disabled={atualizandoItem === item.produto.id}
                      >
                        <Icon as={FiPlus} />
                      </Button>
                    </Flex>
                  )}

                  {/* Subtotal */}
                  <Box minW="100px" textAlign="right">
                    {comanda.status === 'ABERTA' && (
                      <Text fontSize="sm" color="gray.400">
                        {item.quantidade} × R$ {(item.produto.preco || 0).toFixed(2)}
                      </Text>
                    )}
                    <Text fontWeight="bold" fontSize="lg" color="white">
                      R$ {item.subtotal.toFixed(2)}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Stack>

            <Box mt="auto" bg="dark.900" p={5} borderTop="1px solid" borderColor={borderCard}>
             <Flex justify="space-between" align="center">
                <Text fontSize="lg" color="gray.300">Total</Text>
                <Heading size="lg" color={brandColor}>
                  R$ {(comanda.valorTotal || 0).toFixed(2)}
                </Heading>
             </Flex>
          </Box>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  )
}
