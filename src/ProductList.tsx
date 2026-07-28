import {
  Box,
  Heading,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Button,
  Text,
  Badge,
  Stack,
  Flex,
  IconButton
} from '@chakra-ui/react'
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi'

type Props = {
  produtos: Array<{
    id: number
    nome: string
    preco?: number
    estoque?: number
  }>
  onAdjustStock: (id: number, delta: number) => Promise<void> | void
  onDelete: (id: number) => Promise<void> | void
  loadingIds?: number[]
  deletingIds?: number[]
  isLoading?: boolean
}

export default function ProductList({
  produtos,
  onAdjustStock,
  onDelete,
  loadingIds = [],
  deletingIds = [],
  isLoading = false,
}: Props) {
  const cardBg = 'dark.800'
  const cardBorder = 'dark.700'
  const hoverBg = 'dark.700'

  return (
    <Box 
      bg={cardBg} 
      borderRadius="xl" 
      border="1px solid" 
      borderColor={cardBorder}
      overflow="hidden"
      boxShadow="sm"
    >
      <Box p={6} borderBottom="1px solid" borderColor={cardBorder}>
        <Heading size="md">Catálogo de Produtos</Heading>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Gerencie o estoque e preços dos itens disponíveis
        </Text>
      </Box>

      <Stack spacing={3} p={4} display={{ base: 'flex', md: 'none' }}>
        {isLoading && produtos.length === 0 && (
          <Box textAlign="center" py={8} color="gray.300">
            Carregando produtos...
          </Box>
        )}

        {!isLoading && produtos.length === 0 && (
          <Box textAlign="center" py={8} color="gray.500">
            Nenhum produto cadastrado.
          </Box>
        )}

        {produtos.map(p => {
          const estoque = p.estoque ?? 0
          const isUpdating = loadingIds.includes(p.id)
          const isDeleting = deletingIds.includes(p.id)
          const isBusy = isUpdating || isDeleting

          return (
            <Box
              key={p.id}
              bg="dark.900"
              border="1px solid"
              borderColor={cardBorder}
              borderRadius="lg"
              p={4}
            >
              <Flex justify="space-between" align="start" gap={3}>
                <Box minW={0}>
                  <Text fontWeight="bold" noOfLines={2}>{p.nome}</Text>
                  <Text fontSize="sm" color="green.300" fontWeight="semibold">
                    R$ {(p.preco || 0).toFixed(2)}
                  </Text>
                </Box>
                <Badge
                  colorScheme={estoque > 0 ? 'blue' : 'red'}
                  variant="subtle"
                  px={2}
                  borderRadius="full"
                  alignSelf="start"
                >
                  {estoque} un
                </Badge>
              </Flex>

              <Flex mt={3} gap={2} align="center">
                <IconButton
                  aria-label="Diminuir estoque"
                  icon={<FiMinus />}
                  size="sm"
                  variant="outline"
                  colorScheme="brand"
                  onClick={() => onAdjustStock(p.id, -1)}
                  isDisabled={estoque <= 0 || isBusy}
                  isLoading={isUpdating}
                />
                <IconButton
                  aria-label="Aumentar estoque"
                  icon={<FiPlus />}
                  size="sm"
                  variant="outline"
                  colorScheme="green"
                  onClick={() => onAdjustStock(p.id, 1)}
                  isDisabled={isBusy}
                  isLoading={isUpdating}
                />
                <Button
                  size="sm"
                  leftIcon={<FiTrash2 />}
                  variant="outline"
                  colorScheme="red"
                  onClick={() => onDelete(p.id)}
                  isDisabled={isBusy}
                  isLoading={isDeleting}
                  flex="1"
                >
                  Excluir
                </Button>
              </Flex>
            </Box>
          )
        })}
      </Stack>

      <Box overflowX="auto" display={{ base: 'none', md: 'block' }}>
        <Table variant="simple">
          <Thead bg="dark.900">
            <Tr>
              <Th color="gray.300">Nome</Th>
              <Th color="gray.300" isNumeric>Preço</Th>
              <Th color="gray.300" textAlign="center">Estoque</Th>
              <Th color="gray.300" textAlign="right">Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {produtos.map(p => {
              const estoque = p.estoque ?? 0
              const isUpdating = loadingIds.includes(p.id)
              const isDeleting = deletingIds.includes(p.id)
              const isBusy = isUpdating || isDeleting

              return (
              <Tr key={p.id} _hover={{ bg: hoverBg }}>
                <Td fontWeight="bold">{p.nome}</Td>
                <Td isNumeric color="green.300">
                  R$ {(p.preco || 0).toFixed(2)}
                </Td>
                <Td textAlign="center">
                  <Badge 
                    colorScheme={estoque > 0 ? 'blue' : 'red'}
                    variant="subtle"
                    px={2}
                    borderRadius="full"
                  >
                    {estoque} un
                  </Badge>
                </Td>
                <Td textAlign="right">
                  <Box display="inline-flex" gap={2}>
                    <IconButton
                      aria-label="Diminuir estoque"
                      size="sm"
                      icon={<FiMinus />}
                      variant="outline"
                      colorScheme="brand"
                      onClick={() => onAdjustStock(p.id, -1)}
                      isDisabled={estoque <= 0 || isBusy}
                      isLoading={isUpdating}
                    />
                    <IconButton
                      aria-label="Aumentar estoque"
                      size="sm"
                      icon={<FiPlus />}
                      variant="outline"
                      colorScheme="green"
                      onClick={() => onAdjustStock(p.id, 1)}
                      isDisabled={isBusy}
                      isLoading={isUpdating}
                      _hover={{ bg: 'brand.500', color: 'black' }}
                    />
                    <Button
                      size="sm"
                      leftIcon={<FiTrash2 />}
                      variant="outline"
                      colorScheme="red"
                      onClick={() => onDelete(p.id)}
                      isDisabled={isBusy}
                      isLoading={isDeleting}
                    >
                      Excluir
                    </Button>
                  </Box>
                </Td>
              </Tr>
            )})}
            {isLoading && produtos.length === 0 && (
              <Tr>
                <Td colSpan={4} textAlign="center" py={8} color="gray.300">
                  Carregando produtos...
                </Td>
              </Tr>
            )}
            {!isLoading && produtos.length === 0 && (
              <Tr>
                <Td colSpan={4} textAlign="center" py={8} color="gray.500">
                  Nenhum produto cadastrado.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}
