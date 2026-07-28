import { Box } from '@chakra-ui/react'

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <Box maxW="1200px" mx="auto" p={{ base: 3, md: 6 }}>
      {children}
    </Box>
  )
}
