import { useState } from 'react'
import { 
  Box, 
  Button, 
  Input, 
  Heading, 
  FormControl, 
  FormLabel, 
  FormErrorMessage,
  InputGroup, 
  InputLeftElement,
  Flex,
  Icon
} from '@chakra-ui/react'
import { FiPlus, FiTag, FiDollarSign, FiPackage } from 'react-icons/fi'

type Props = {
  onCreate: (payload: {
    nome: string
    preco: number
    estoque: number
  }) => Promise<void>
  isSubmitting?: boolean
}

export default function ProductForm({ onCreate, isSubmitting = false }: Props) {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [estoque, setEstoque] = useState('0')
  const [errors, setErrors] = useState<{ nome?: string; preco?: string; estoque?: string }>({})

  const cardBg = 'dark.800'
  const cardBorder = 'dark.700'

  function validate() {
    const nextErrors: { nome?: string; preco?: string; estoque?: string } = {}
    const nomeNormalizado = nome.trim().replace(/\s+/g, ' ')
    const precoNumero = Number(preco)
    const estoqueNumero = Number(estoque)

    if (nomeNormalizado.length < 3) {
      nextErrors.nome = 'Use pelo menos 3 caracteres'
    }

    if (!Number.isFinite(precoNumero) || precoNumero <= 0) {
      nextErrors.preco = 'Informe um preco maior que zero'
    }

    if (!Number.isInteger(estoqueNumero) || estoqueNumero < 0) {
      nextErrors.estoque = 'Informe um estoque inteiro maior ou igual a zero'
    }

    setErrors(nextErrors)
    return {
      isValid: Object.keys(nextErrors).length === 0,
      nome: nomeNormalizado,
      preco: precoNumero,
      estoque: estoqueNumero,
    }
  }

  async function submit() {
    if (isSubmitting) return

    const validated = validate()
    if (!validated.isValid) return

    try {
      await onCreate({
        nome: validated.nome,
        preco: validated.preco,
        estoque: validated.estoque,
      })
      setNome('')
      setPreco('')
      setEstoque('0')
      setErrors({})
    } catch {
      // O feedback da falha eh centralizado no componente pai.
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
        <FormControl flex={1} minW="200px" isInvalid={!!errors.nome}>
          <FormLabel>Nome do Produto</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none"><FiTag color="rgb(209, 213, 219)" /></InputLeftElement>
            <Input
              placeholder="Ex: Água Mineral"
              value={nome}
              onChange={e => {
                setNome(e.target.value)
                if (errors.nome) {
                  setErrors(prev => ({ ...prev, nome: undefined }))
                }
              }}
              bg="dark.900"
              borderColor="dark.700"
              color="white"
              _placeholder={{ color: 'gray.300' }}
            />
          </InputGroup>
          <FormErrorMessage>{errors.nome}</FormErrorMessage>
        </FormControl>

        <FormControl width={{ base: '100%', md: '200px' }} isInvalid={!!errors.preco}>
          <FormLabel>Preço (R$)</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none"><FiDollarSign color="rgb(209, 213, 219)" /></InputLeftElement>
            <Input
              placeholder="0.00"
              type="number"
              min={0}
              step="0.01"
              value={preco}
              onChange={e => {
                setPreco(e.target.value)
                if (errors.preco) {
                  setErrors(prev => ({ ...prev, preco: undefined }))
                }
              }}
              bg="dark.900"
              borderColor="dark.700"
              color="white"
              _placeholder={{ color: 'gray.300' }}
            />
          </InputGroup>
          <FormErrorMessage>{errors.preco}</FormErrorMessage>
        </FormControl>

        <FormControl width={{ base: '100%', md: '180px' }} isInvalid={!!errors.estoque}>
          <FormLabel>Estoque Inicial</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none"><FiPackage color="rgb(209, 213, 219)" /></InputLeftElement>
            <Input
              placeholder="0"
              type="number"
              min={0}
              step="1"
              value={estoque}
              onChange={e => {
                setEstoque(e.target.value)
                if (errors.estoque) {
                  setErrors(prev => ({ ...prev, estoque: undefined }))
                }
              }}
              bg="dark.900"
              borderColor="dark.700"
              color="white"
              _placeholder={{ color: 'gray.300' }}
            />
          </InputGroup>
          <FormErrorMessage>{errors.estoque}</FormErrorMessage>
        </FormControl>

        <Button 
          colorScheme="brand" 
          bg="brand.500" 
          color="black"
          onClick={submit}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
          px={8}
          minW="120px"
        >
          Cadastrar
        </Button>
      </Flex>
    </Box>
  )
}
