import { ChakraProvider, ColorModeScript, Flex } from '@chakra-ui/react'
import { GoogleTagManager } from '@next/third-parties/google'

import Navbar from '@/app/components/Navbar'

export const metadata = {
  title: 'git reporter',
  description: 'Gain insights from your GIT history',
}

export default function RootLayout({ children }) {
  return (
    <html lang={'en'}>
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
