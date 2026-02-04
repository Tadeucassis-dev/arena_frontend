import { Box, Flex, Text, Image, useColorModeValue } from '@chakra-ui/react'
import Logo from '../assets/logoPreta.png'

export function Footer() {
  const bg = useColorModeValue('dark.900', 'black')
  const borderTop = useColorModeValue('dark.700', 'gray.800')

  return (
    <Box 
      as="footer" 
      bg={bg} 
      borderTop="1px solid" 
      borderColor={borderTop}
      py={8}
      mt="auto"
    >
      <Flex 
        direction="column" 
        align="center" 
        justify="center" 
        maxW="1200px" 
        mx="auto" 
        px={4}
        gap={4}
      >
       
        <Text color="brand.400" fontSize="sm" textAlign="center">
          © {new Date().getFullYear()} Arena Cesar - Centro de Treinamento e Lazer. Todos os direitos reservados.
        </Text>
      </Flex>
    </Box>
  )
}