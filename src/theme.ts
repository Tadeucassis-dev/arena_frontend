import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: '#0B0B0B',
        color: 'white',
      },
    },
  },
  colors: {
    brand: {
      500: '#C9A24D',
      400: '#E6C77A',
    },
    dark: {
      900: '#0B0B0B',
      800: '#141414',
      700: '#242424',
      600: '#2F2F2F',
      500: '#3A3A3A',
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'xl',
        fontWeight: 'bold',
        _focusVisible: {
          boxShadow: '0 0 0 3px rgba(201, 162, 77, 0.35)',
        },
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'black',
          _hover: { bg: 'brand.400' },
          _active: { bg: 'brand.400' },
        },
        ghost: {
          bg: 'whiteAlpha.100',
          color: 'white',
          _hover: { bg: 'whiteAlpha.200' },
          _active: { bg: 'whiteAlpha.300' },
        },
        outline: {
          borderColor: 'dark.600',
          color: 'white',
          _hover: { bg: 'whiteAlpha.100' },
          _active: { bg: 'whiteAlpha.200' },
        },
      },
    },
    IconButton: {
      baseStyle: {
        _focusVisible: {
          boxShadow: '0 0 0 3px rgba(201, 162, 77, 0.35)',
        },
      },
      variants: {
        ghost: {
          bg: 'whiteAlpha.100',
          color: 'white',
          _hover: { bg: 'whiteAlpha.200' },
          _active: { bg: 'whiteAlpha.300' },
        },
        outline: {
          borderColor: 'dark.600',
          color: 'white',
          _hover: { bg: 'whiteAlpha.100' },
          _active: { bg: 'whiteAlpha.200' },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          bg: 'dark.800',
          borderColor: 'dark.600',
          _hover: { borderColor: 'dark.500' },
          _focusVisible: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px rgba(201, 162, 77, 0.55)',
          },
          _placeholder: { color: 'gray.400' },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'dark.800',
          borderColor: 'dark.700',
        },
      },
    },
  },
})

export default theme
