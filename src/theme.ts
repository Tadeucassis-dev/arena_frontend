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
      700: '#1F1F1F',
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'xl',
        fontWeight: 'bold',
      },
    },
    Input: {
      baseStyle: {
        field: {
          bg: 'dark.700',
        },
      },
    },
  },
})

export default theme
