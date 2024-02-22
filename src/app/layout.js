'use client'

import { ChakraProvider, ColorModeScript, Flex } from '@chakra-ui/react'
import { GoogleTagManager } from '@next/third-parties/google'

import Navbar from '@/app/components/Navbar'

export default function RootLayout({ children }) {
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
      <GoogleTagManager gtmId='GTM-MR2PG3HB' />
    </html>
  )
}
