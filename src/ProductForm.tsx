import { useState } from 'react'
import { 
  Box, 
  Button, 
  Input, 
  Stack, 
  Heading, 
  FormControl, 
  FormLabel, 
  InputGroup, 
  InputLeftElement,
  Flex,
  Icon,
  useColorModeValue 
} from '@chakra-ui/react'
import { FiPlus, FiTag, FiDollarSign } from 'react-icons/fi'

export default function ProductForm({ onCreate }: any) {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [loading, setLoading] = useState(false)

  const cardBg = 'dark.800'
  const cardBorder = 'dark.700'

  async function submit() {
    if (!nome || !preco) return
    setLoading(true)
    try {
      await onCreate({ nome, preco: Number(preco), estoque: 0 })
      setNome('')
      setPreco('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box 
      bg={cardBg} 
      p={6} 
      mb={8} 
      borderRadius="xl" 
      border="1px solid" 
      borderColor={cardBorder}
      boxShadow="lg"
    >
      <Flex align="center" mb={6}>
         <Icon as={FiPlus} color="brand.500" w={6} h={6} mr={2} />
         <Heading size="md">Novo Produto</Heading>
      </Flex>

      <Flex gap={4} wrap="wrap" align="flex-end">
        <FormControl flex={1} minW="200px">
          <FormLabel>Nome do Produto</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none"><FiTag color="gray.500" /></InputLeftElement>
            <Input
              placeholder="Ex: Água Mineral"
              value={nome}
              onChange={e => setNome(e.target.value)}
              bg="dark.900"
              borderColor="dark.700"
            />
          </InputGroup>
        </FormControl>

        <FormControl width={{ base: '100%', md: '200px' }}>
          <FormLabel>Preço (R$)</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none"><FiDollarSign color="gray.500" /></InputLeftElement>
            <Input
              placeholder="0.00"
              type="number"
              value={preco}
              onChange={e => setPreco(e.target.value)}
              bg="dark.900"
              borderColor="dark.700"
            />
          </InputGroup>
        </FormControl>

        <Button 
          colorScheme="brand" 
          bg="brand.500" 
          color="black"
          onClick={submit}
          isLoading={loading}
          px={8}
          minW="120px"
        >
          Cadastrar
        </Button>
      </Flex>
    </Box>
  )
}
