import { useEffect, useRef, useState } from 'react'
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
  Spinner,
  Image,
  Icon,
  Spacer,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  Card,
  CardBody,
  Tooltip
} from '@chakra-ui/react'
import {
  FiArrowLeft,
  FiTrash2,
  FiCheckCircle,
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiDollarSign,
  FiClock
} from 'react-icons/fi'

import { ComandaItemForm } from './ComandaItemForm'
import Logo from './assets/logoPreta.png'
import { Produto } from './types/produtos'
import { Pagamento } from './types/comanda'
import { atualizarQuantidadeItem, getErrorMessage } from './api'

type ItemComanda = {
  id: number
  produto: Produto
  quantidade: number
  subtotal: number
}

type ComandaLocal = {
  id: number
  nomeCliente: string
  status: 'ABERTA' | 'FECHADA'
  valorTotal?: number
  itens: ItemComanda[]
  pagamentos?: Pagamento[]
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
  onRegistrarPagamento: (comandaId: number, valor: number) => Promise<any>
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
  onRegistrarPagamento,
  onGetComanda,
  onDeletarComanda,
  onProdutosAtualizados,
  onVoltar,
}: Props) {
  const [comanda, setComanda] = useState<ComandaLocal | null>(null)
  const [err, setErr] = useState('')
  const [carregandoComanda, setCarregandoComanda] = useState(true)
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<'fechar' | 'excluir' | 'pagamento' | null>(null)
  const [atualizandoItem, setAtualizandoItem] = useState<number | null>(null)
  const [valorPagamento, setValorPagamento] = useState('')
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  async function loadComanda(showPageLoading = true) {
    try {
      if (showPageLoading) {
        setCarregandoComanda(true)
      }

      setErr('')
      const data = await onGetComanda(comandaId)
      setComanda(data)
      return data
    } catch (e: unknown) {
      const message = getErrorMessage(e, 'Erro ao carregar comanda')
      setErr(message)
      throw e
    } finally {
      if (showPageLoading) {
        setCarregandoComanda(false)
      }
    }
  }

  useEffect(() => {
    loadComanda().catch(() => {})
  }, [comandaId])

  async function refresh() {
    await loadComanda(false)
    await onProdutosAtualizados?.()
  }

  async function confirmarFechar() {
    if (acaoEmAndamento) return

    setAcaoEmAndamento('fechar')
    try {
      await onFecharComanda(comandaId)
      onClose()
      toast({
        title: 'Comanda fechada',
        description: `Comanda de ${comanda?.nomeCliente || ''} foi finalizada com sucesso`,
        status: 'success',
        isClosable: true,
        duration: 2500,
      })
      onVoltar()
    } catch (e: unknown) {
      onClose()
      toast({
        title: 'Erro ao fechar comanda',
        description: getErrorMessage(e, 'Nao foi possivel fechar a comanda'),
        status: 'error',
        isClosable: true,
        duration: 4000,
      })
    } finally {
      setAcaoEmAndamento(null)
    }
  }

  async function handleRegistrarPagamento() {
    if (acaoEmAndamento || !comanda || comanda.status !== 'ABERTA') return

    const valorNum = Number(valorPagamento.replace(',', '.'))
    if (!Number.isFinite(valorNum) || valorNum <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Informe um valor maior que zero',
        status: 'warning',
        isClosable: true,
        duration: 2500,
      })
      return
    }

    setAcaoEmAndamento('pagamento')
    try {
      await onRegistrarPagamento(comandaId, valorNum)
      setValorPagamento('')
      await loadComanda(false)
      toast({
        title: 'Pagamento registrado',
        description: `R$ ${valorNum.toFixed(2)} recebido de ${comanda.nomeCliente || ''}`,
        status: 'success',
        isClosable: true,
        duration: 2500,
      })
    } catch (e: unknown) {
      toast({
        title: 'Erro no pagamento',
        description: getErrorMessage(e, 'Nao foi possivel registrar o pagamento'),
        status: 'error',
        isClosable: true,
        duration: 4000,
      })
    } finally {
      setAcaoEmAndamento(null)
    }
  }

  async function handleDelete() {
    if (acaoEmAndamento) return
    if (!confirm('Deseja realmente excluir esta comanda?')) return

    setAcaoEmAndamento('excluir')
    try {
      await onDeletarComanda(comandaId)
      toast({
        title: 'Comanda excluida',
        description: 'A comanda foi removida com sucesso',
        status: 'success',
        isClosable: true,
        duration: 2500,
      })
      onVoltar()
    } catch (e: unknown) {
      toast({
        title: 'Erro ao excluir comanda',
        description: getErrorMessage(e, 'Nao foi possivel excluir a comanda'),
        status: 'error',
        isClosable: true,
        duration: 4000,
      })
    } finally {
      setAcaoEmAndamento(null)
    }
  }

  async function handleAtualizarQuantidade(produtoId: number, novaQuantidade: number) {
    if (atualizandoItem === produtoId || acaoEmAndamento) return

    setAtualizandoItem(produtoId)
    try {
      await atualizarQuantidadeItem({
        comandaId,
        produtoId,
        quantidade: novaQuantidade
      })
      await refresh()
      toast({
        title: 'Quantidade atualizada',
        description: novaQuantidade > 0
          ? 'O item foi atualizado na comanda'
          : 'O item foi removido da comanda',
        status: 'success',
        isClosable: true,
        duration: 1500,
      })
    } catch (e: unknown) {
      toast({
        title: 'Erro ao atualizar item',
        description: getErrorMessage(e, 'Nao foi possivel atualizar a quantidade'),
        status: 'error',
        isClosable: true,
        duration: 4000,
      })
    } finally {
      setAtualizandoItem(null)
    }
  }

  if (carregandoComanda) {
    return (
      <Flex minH="240px" align="center" justify="center" direction="column" gap={3}>
        <Spinner color="brand.500" thickness="3px" size="xl" />
        <Text color="gray.300">Carregando comanda...</Text>
      </Flex>
    )
  }

  if (!comanda) {
    return <Text color="gray.300">Comanda nao encontrada.</Text>
  }

  const bgCard = 'dark.800'
  const borderCard = 'dark.700'
  const brandColor = 'brand.500'

  const pagamentosOrdenados = [...(comanda.pagamentos || [])].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  )
  const valorTotal = Number(comanda.valorTotal) || 0
  const valorPago = pagamentosOrdenados.reduce(
    (sum, p) => sum + (Number(p.valor) || 0),
    0
  )
  const saldoRestante = Math.max(0, valorTotal - valorPago)
  const porcentagemPaga =
    valorTotal > 0 ? Math.min(100, (valorPago / valorTotal) * 100) : 0

  function formatarDataHora(iso: string) {
    try {
      const d = new Date(iso)
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      return `${dd}/${mm} ${hh}:${mi}`
    } catch {
      return ''
    }
  }

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
              <Flex align="center" gap={2} wrap="wrap">
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
              onClick={onOpen}
              isLoading={acaoEmAndamento === 'fechar'}
              isDisabled={!!acaoEmAndamento || atualizandoItem !== null}
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
            isLoading={acaoEmAndamento === 'excluir'}
            isDisabled={!!acaoEmAndamento || atualizandoItem !== null}
            w={{ base: '100%', sm: 'auto' }}
          >
            Excluir
          </Button>
        </Stack>
      </Flex>

      {err && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {err}
        </Alert>
      )}

      {/* RESUMO FINANCEIRO + PAGAMENTOS */}
      <Stack spacing={4} mb={8}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card bg={bgCard} border="1px solid" borderColor={borderCard} borderRadius="xl" overflow="hidden">
            <CardBody py={4}>
              <Flex align="center" gap={2} mb={2}>
                <Icon as={FiShoppingCart} color="gray.400" />
                <Text fontSize="sm" color="gray.400">Total da Conta</Text>
              </Flex>
              <Heading size="lg" color="white">
                R$ {valorTotal.toFixed(2)}
              </Heading>
            </CardBody>
          </Card>

          <Card bg={bgCard} border="1px solid" borderColor={borderCard} borderRadius="xl" overflow="hidden">
            <CardBody py={4}>
              <Flex align="center" gap={2} mb={2}>
                <Icon as={FiDollarSign} color="green.400" />
                <Text fontSize="sm" color="gray.400">Recebido</Text>
              </Flex>
              <Heading size="lg" color="green.400">
                R$ {valorPago.toFixed(2)}
              </Heading>
              <Flex align="center" gap={3} mt={3}>
                <Progress
                  flex="1"
                  value={porcentagemPaga}
                  colorScheme="green"
                  bg="dark.700"
                  borderRadius="full"
                  size="sm"
                />
                <Text fontSize="xs" color="gray.400" minW="45px" textAlign="right">
                  {porcentagemPaga.toFixed(0)}%
                </Text>
              </Flex>
            </CardBody>
          </Card>

          <Card
            bg={saldoRestante > 0 ? 'rgba(229, 62, 62, 0.06)' : 'rgba(72, 187, 120, 0.06)'}
            border="1px solid"
            borderColor={saldoRestante > 0 ? 'red.900' : 'green.900'}
            borderRadius="xl"
            overflow="hidden"
          >
            <CardBody py={4}>
              <Flex align="center" gap={2} mb={2}>
                <Icon as={FiClock} color={saldoRestante > 0 ? 'red.400' : 'green.400'} />
                <Text fontSize="sm" color="gray.400">
                  {saldoRestante > 0 ? 'Saldo Restante' : 'Quitado'}
                </Text>
              </Flex>
              <Heading
                size="lg"
                color={saldoRestante > 0 ? 'red.300' : 'green.400'}
              >
                R$ {saldoRestante.toFixed(2)}
              </Heading>
              <Text fontSize="xs" color="gray.400" mt={3}>
                {pagamentosOrdenados.length} pagamento(s) registrado(s)
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {comanda.status === 'ABERTA' && saldoRestante > 0 && (
          <Card bg={bgCard} border="1px solid" borderColor={borderCard} borderRadius="xl" overflow="hidden">
            <CardBody>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ md: 'end' }}
                gap={4}
              >
                <FormControl flex="1">
                  <FormLabel color="gray.300" fontWeight="semibold">
                    Registrar Pagamento Parcial
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Text color={brandColor} fontWeight="bold">
                        R$
                      </Text>
                    </InputLeftElement>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={saldoRestante}
                      value={valorPagamento}
                      onChange={e => setValorPagamento(e.target.value)}
                      placeholder={`Ex.: ${saldoRestante > 40 ? '40,00' : saldoRestante.toFixed(2)}`}
                      bg="dark.900"
                      borderColor="dark.700"
                      color="white"
                      _placeholder={{ color: 'gray.500' }}
                      isDisabled={!!acaoEmAndamento}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleRegistrarPagamento()
                        }
                      }}
                    />
                  </InputGroup>
                </FormControl>

                <Flex gap={2} w={{ base: '100%', md: 'auto' }}>
                  <Tooltip label="Paga metade do saldo">
                    <Button
                      variant="outline"
                      size="lg"
                      color="gray.300"
                      borderColor="whiteAlpha.300"
                      bg="whiteAlpha.50"
                      onClick={() =>
                        setValorPagamento(
                          String((Math.round((saldoRestante / 2) * 100) / 100).toFixed(2))
                        )
                      }
                      isDisabled={!!acaoEmAndamento}
                      minW={{ base: '33%', md: 'auto' }}
                    >
                      50%
                    </Button>
                  </Tooltip>
                  <Tooltip label="Paga o saldo total">
                    <Button
                      variant="outline"
                      size="lg"
                      color="gray.300"
                      borderColor="whiteAlpha.300"
                      bg="whiteAlpha.50"
                      onClick={() => setValorPagamento(saldoRestante.toFixed(2))}
                      isDisabled={!!acaoEmAndamento}
                      minW={{ base: '33%', md: 'auto' }}
                    >
                      Total
                    </Button>
                  </Tooltip>
                  <Button
                    leftIcon={<FiDollarSign />}
                    size="lg"
                    colorScheme="green"
                    onClick={handleRegistrarPagamento}
                    isLoading={acaoEmAndamento === 'pagamento'}
                    loadingText="Registrando..."
                    isDisabled={!!acaoEmAndamento}
                    flex="1"
                    minW={{ base: '33%', md: '200px' }}
                  >
                    Receber
                  </Button>
                </Flex>
              </Flex>
            </CardBody>
          </Card>
        )}

        {pagamentosOrdenados.length > 0 && (
          <Card bg={bgCard} border="1px solid" borderColor={borderCard} borderRadius="xl" overflow="hidden">
            <Box
              p={4}
              bg="dark.900"
              borderBottom="1px solid"
              borderColor={borderCard}
            >
              <Flex align="center" gap={2}>
                <Icon as={FiDollarSign} color={brandColor} />
                <Heading size="sm" color="white">Histórico de Pagamentos</Heading>
                <Spacer />
                <Badge colorScheme="green">{pagamentosOrdenados.length}</Badge>
              </Flex>
            </Box>
            <Stack divider={<Divider borderColor="dark.700" />}>
              {pagamentosOrdenados.map(p => (
                <Flex
                  key={p.id}
                  px={4}
                  py={3}
                  justify="space-between"
                  align="center"
                  _hover={{ bg: 'whiteAlpha.50' }}
                >
                  <Flex align="center" gap={3}>
                    <Box
                      p={2}
                      borderRadius="full"
                      bg="green.900"
                      color="green.300"
                      display="flex"
                    >
                      <Icon as={FiDollarSign} />
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="white">
                        R$ {(Number(p.valor) || 0).toFixed(2)}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {formatarDataHora(p.data)}
                      </Text>
                    </Box>
                  </Flex>
                  <Badge colorScheme="green" fontSize="sm">
                    Recebido
                  </Badge>
                </Flex>
              ))}
            </Stack>
          </Card>
        )}
      </Stack>

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
                    if (acaoEmAndamento) return
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
                        isDisabled={atualizandoItem === item.produto.id || !!acaoEmAndamento}
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
                        isDisabled={atualizandoItem === item.produto.id || !!acaoEmAndamento}
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
             <Stack spacing={3}>
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.400">Total Consumo</Text>
                  <Text fontWeight="semibold" color="gray.300">
                    R$ {valorTotal.toFixed(2)}
                  </Text>
                </Flex>

                {valorPago > 0 && (
                  <>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.400">Recebido (parcial)</Text>
                      <Text fontWeight="semibold" color="green.400">
                        − R$ {valorPago.toFixed(2)}
                      </Text>
                    </Flex>
                    <Divider borderColor="dark.700" />
                  </>
                )}

                <Flex justify="space-between" align="center">
                  <Text fontSize="md" fontWeight="bold" color={saldoRestante > 0 ? 'white' : 'green.400'}>
                    {saldoRestante > 0 ? 'Saldo a Pagar' : 'Total Quitado'}
                  </Text>
                  <Heading
                    size="lg"
                    color={saldoRestante > 0 ? brandColor : 'green.400'}
                  >
                    R$ {saldoRestante.toFixed(2)}
                  </Heading>
                </Flex>
             </Stack>
          </Box>
          </Box>
        </Box>
      </SimpleGrid>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef as any}
        onClose={onClose}
        size={{ base: 'xs', sm: 'md' }}
        isCentered
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(4px)">
          <AlertDialogContent
            bg="dark.800"
            border="1px solid"
            borderColor="brand.500"
            borderRadius="2xl"
            shadow="2xl"
          >
            <AlertDialogHeader
              bg="dark.900"
              borderTopRadius="2xl"
              borderBottom="1px solid"
              borderColor="dark.700"
              py={4}
              px={6}
            >
              <Flex align="center" gap={3}>
                <Box
                  p={2}
                  borderRadius="xl"
                  bg="brand.500"
                  color="black"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiCheckCircle} w={5} h={5} />
                </Box>
                <Heading size="md" color="white">Fechar Comanda</Heading>
              </Flex>
            </AlertDialogHeader>

            <AlertDialogBody px={6} py={5}>
              <Stack spacing={4}>
                <Box
                  p={4}
                  bg="dark.900"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="dark.700"
                >
                  <Text fontSize="sm" color="gray.400" mb={1}>Cliente</Text>
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    {comanda?.nomeCliente || 'Sem nome'}
                  </Text>
                  <Flex mt={3} gap={6} wrap="wrap">
                    <Box>
                      <Text fontSize="xs" color="gray.400">Comanda</Text>
                      <Badge mt={1} colorScheme="brand" fontSize="sm">
                        #{comanda?.id}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.400">Status</Text>
                      <Badge mt={1} colorScheme="green" fontSize="sm">
                        ABERTA
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.400">Total</Text>
                      <Text fontWeight="bold" fontSize="md" color="brand.500" mt={1}>
                        R$ {valorTotal.toFixed(2)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.400">Saldo</Text>
                      <Text
                        fontWeight="bold"
                        fontSize="md"
                        color={saldoRestante > 0 ? 'red.300' : 'green.400'}
                        mt={1}
                      >
                        R$ {saldoRestante.toFixed(2)}
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                {saldoRestante > 0 ? (
                  <Alert
                    status="warning"
                    borderRadius="xl"
                    bg="rgba(230, 180, 60, 0.08)"
                    border="1px solid"
                    borderColor="yellow.900"
                  >
                    <AlertIcon color="yellow.400" />
                    <Box fontSize="sm" color="gray.300">
                      <Text fontWeight="semibold" color="white">
                        Saldo pendente: R$ {saldoRestante.toFixed(2)}
                      </Text>
                      <Text>
                        Fechar a comanda com saldo em aberto significa marcar o pagamento como
                        realizado em momento posterior.
                      </Text>
                    </Box>
                  </Alert>
                ) : (
                  <Alert
                    status="success"
                    borderRadius="xl"
                    bg="rgba(72, 187, 120, 0.08)"
                    border="1px solid"
                    borderColor="green.900"
                  >
                    <AlertIcon color="green.400" />
                    <Box fontSize="sm" color="gray.300">
                      <Text fontWeight="semibold" color="white">Conta quitada</Text>
                      <Text>O valor total já foi recebido integralmente.</Text>
                    </Box>
                  </Alert>
                )}

                <Text color="gray.300" fontSize="sm">
                  Deseja realmente <strong style={{ color: 'white' }}>fechar</strong> esta comanda?
                  Esta ação <strong style={{ color: '#F56565' }}>não pode ser desfeita</strong>.
                </Text>
              </Stack>
            </AlertDialogBody>

            <AlertDialogFooter
              bg="dark.900"
              borderBottomRadius="2xl"
              borderTop="1px solid"
              borderColor="dark.700"
              px={6}
              py={4}
            >
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                w="full"
                spacing={3}
                justify="flex-end"
              >
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  variant="outline"
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.300"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200', borderColor: 'whiteAlpha.400' }}
                  w={{ base: 'full', sm: 'auto' }}
                  isDisabled={acaoEmAndamento !== null}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarFechar}
                  colorScheme="brand"
                  bg="brand.500"
                  color="black"
                  _hover={{ bg: 'brand.400' }}
                  leftIcon={<FiCheckCircle />}
                  isLoading={acaoEmAndamento === 'fechar'}
                  loadingText="Fechando..."
                  w={{ base: 'full', sm: 'auto' }}
                >
                  Sim, Fechar
                </Button>
              </Stack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}
