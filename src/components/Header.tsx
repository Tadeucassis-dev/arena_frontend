import { Flex, Button, Text, Stack } from '@chakra-ui/react'
import { FiGrid, FiBox, FiHome } from 'react-icons/fi'

export function Header({ hash }: { hash: string }) {
  const borderColor = 'dark.700'
  const brandColor = 'brand.500'

  return (
    <Flex
      bgColor={'blackAlpha.900'}
      px={{ base: 4, md: 8 }}
      py={4}
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      align={{ base: 'stretch', md: 'center' }}
      borderBottom="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={100}
      gap={{ base: 3, md: 0 }}
    >
      <Flex
        align="center"
        justify={{ base: 'center', md: 'flex-start' }}
        gap={4}
        cursor="pointer"
        w={{ base: '100%', md: 'auto' }}
        onClick={() => window.location.hash = '#/'}
      >

        <Stack spacing={0} display={{ base: 'none', md: 'block' }}>
          <Text fontWeight="bold" fontSize="lg" color={brandColor} lineHeight="1.2">
            ARENA CÉSAR
          </Text>
          <Text fontSize="xs" color="gray.300" letterSpacing="wide" >
            CENTRO DE TREINAMENTO E LAZER
          </Text>
        </Stack>
      </Flex>

      <Stack
        direction={{ base: 'column', sm: 'row' }}
        spacing={2}
        w={{ base: '100%', md: 'auto' }}
      >
        <Button
          variant={hash === '#/' || hash === '' ? 'solid' : 'ghost'}
          colorScheme="brand"
          bg={hash === '#/' || hash === '' ? brandColor : 'whiteAlpha.100'}
          color={hash === '#/' || hash === '' ? 'black' : 'white'}
          size="sm"
          leftIcon={<FiHome />}
          onClick={() => (window.location.hash = '#/')}
          _hover={{ bg: hash === '#/' || hash === '' ? 'brand.400' : 'whiteAlpha.200' }}
          w={{ base: '100%', sm: 'auto' }}
        >
          Início
        </Button>
        <Button
          variant={hash.startsWith('#/comandas') ? 'solid' : 'ghost'}
          colorScheme="brand"
          bg={hash.startsWith('#/comandas') ? brandColor : 'whiteAlpha.100'}
          color={hash.startsWith('#/comandas') ? 'black' : 'white'}
          size="sm"
          leftIcon={<FiGrid />}
          onClick={() => (window.location.hash = '#/comandas')}
          _hover={{ bg: hash.startsWith('#/comandas') ? 'brand.400' : 'whiteAlpha.200' }}
          w={{ base: '100%', sm: 'auto' }}
        >
          Comandas
        </Button>
        <Button
          leftIcon={<FiBox />}
          variant={hash === '#/produtos' ? 'solid' : 'ghost'}
          colorScheme="brand"
          bg={hash === '#/produtos' ? brandColor : 'whiteAlpha.100'}
          color={hash === '#/produtos' ? 'black' : 'white'}
          onClick={() => (window.location.hash = '#/produtos')}
          size="sm"
          _hover={{ bg: hash === '#/produtos' ? 'brand.400' : 'whiteAlpha.200' }}
          w={{ base: '100%', sm: 'auto' }}
        >
          Produtos
        </Button>
      </Stack>
    </Flex>
  )
}
