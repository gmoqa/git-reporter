import { ChakraProvider, ColorModeScript, Flex } from '@chakra-ui/react'
import { GoogleTagManager } from '@next/third-parties/google'
import { ReCaptchaProvider } from 'next-recaptcha-v3'

import Navbar from '@/app/components/Navbar'

export const metadata = {
  title: 'git reporter',
  description: 'Gain insights from your GIT history',
}

export default function RootLayout({ children }) {
  return (
    <html lang={'en'}>
      <body>
        <ReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_API_KEY}
        >
          <ColorModeScript initialColorMode={'dark'} />
          <ChakraProvider>
            <Flex direction='column' flex='1' h='calc(100vh)'>
              <Navbar />
              {children}
            </Flex>
          </ChakraProvider>
        </ReCaptchaProvider>
      </body>
      <GoogleTagManager gtmId='GTM-MR2PG3HB' />
    </html>
  )
}
