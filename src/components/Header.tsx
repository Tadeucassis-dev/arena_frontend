import { Flex, Image, Button, Text, Stack, Box, useColorModeValue } from '@chakra-ui/react'
import { FiGrid, FiBox, FiHome } from 'react-icons/fi'
import Logo from '../assets/logoPreta.png'

export function Header({ hash }: { hash: string }) {
  const bg = 'dark.900'
  const borderColor = 'dark.700'
  const brandColor = 'brand.500'

  return (
    <Flex
      bgColor={'blackAlpha.900'}
      px={{ base: 4, md: 8 }}
      py={4}
      justify="space-between"
      align="center"
      borderBottom="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={100}
    >
      <Flex align="center" gap={4} cursor="pointer" onClick={() => window.location.hash = '#/'}>
        
        <Stack spacing={0} display={{ base: 'none', md: 'block' }}>
          <Text fontWeight="bold" fontSize="lg" color={brandColor} lineHeight="1.2">
            ARENA CÉSAR
          </Text>
          <Text fontSize="xs" color="gray.400" letterSpacing="wide">
            CENTRO DE TREINAMENTO E LAZER
          </Text>
        </Stack>
      </Flex>

      <Flex gap={2}>
        <Button
          variant={hash === '#/' || hash === '' ? 'solid' : 'ghost'}
          colorScheme="brand"
          size="sm"
          leftIcon={<FiHome />}
          onClick={() => (window.location.hash = '#/')}
        >
          Início
        </Button>
        <Button
          variant={hash.startsWith('#/comandas') ? 'solid' : 'ghost'}
          colorScheme="brand"
          size="sm"
          leftIcon={<FiGrid />}
          onClick={() => (window.location.hash = '#/comandas')}
        >
          Comandas
        </Button>
        <Button
          leftIcon={<FiBox />}
          variant={hash === '#/produtos' ? 'solid' : 'ghost'}
          colorScheme={hash === '#/produtos' ? 'brand' : 'gray'}
          bg={hash === '#/produtos' ? brandColor : 'transparent'}
          color={hash === '#/produtos' ? 'black' : 'gray.300'}
          onClick={() => (window.location.hash = '#/produtos')}
          size="sm"
          _hover={{ bg: hash === '#/produtos' ? 'brand.400' : 'whiteAlpha.100' }}
        >
          Produtos
        </Button>
      </Flex>
    </Flex>
  )
}
