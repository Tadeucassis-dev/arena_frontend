import { Box } from '@chakra-ui/react'

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <Box
      bg="dark.800"
      p={6}
      borderRadius="2xl"
      border="1px solid"
      borderColor="dark.700"
    >
      {children}
    </Box>
  )
}
