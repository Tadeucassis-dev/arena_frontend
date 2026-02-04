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
  IconButton,
  Text,
  useColorModeValue,
  Flex,
  Badge
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'

export default function ProductList({ produtos, onUpdate }: any) {
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

      <Box overflowX="auto">
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
            {produtos.map((p: any) => (
              <Tr key={p.id} _hover={{ bg: hoverBg }}>
                <Td fontWeight="bold">{p.nome}</Td>
                <Td isNumeric color="green.300">
                  R$ {(p.preco || 0).toFixed(2)}
                </Td>
                <Td textAlign="center">
                  <Badge 
                    colorScheme={p.estoque > 0 ? 'blue' : 'red'}
                    variant="subtle"
                    px={2}
                    borderRadius="full"
                  >
                    {p.estoque} un
                  </Badge>
                </Td>
                <Td textAlign="right">
                  <Button
                    size="sm"
                    leftIcon={<FiPlus />}
                    variant="outline"
                    colorScheme="brand"
                    onClick={() =>
                      onUpdate(p.id, { estoque: (p.estoque || 0) + 1 })
                    }
                    _hover={{ bg: 'brand.500', color: 'black' }}
                  >
                    Estoque
                  </Button>
                </Td>
              </Tr>
            ))}
            {produtos.length === 0 && (
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
