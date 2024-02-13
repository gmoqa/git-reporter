import { ChakraProvider, ColorModeScript, Flex } from '@chakra-ui/react'

import Navbar from '@/app/components/Navbar'

export default async function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ColorModeScript initialColorMode={'dark'} />
        <ChakraProvider>
          <Flex direction='column' flex='1' h='calc(100vh)'>
            <Navbar />
            {children}
          </Flex>
        </ChakraProvider>
      </body>
    </html>
  )
}
