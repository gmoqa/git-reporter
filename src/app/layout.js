import { ChakraProvider, Flex, defaultSystem } from '@chakra-ui/react'
import { ToastContainer } from '@chakra-ui/toast'
import { ThemeProvider } from 'next-themes'
import { GoogleTagManager } from '@next/third-parties/google'
import { ReCaptchaProvider } from 'next-recaptcha-v3'
import { Inter } from 'next/font/google'

import Navbar from '@/app/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'git reporter',
  description: 'Gain insights from your GIT history',
}

export default function RootLayout({ children }) {
  return (
    <html lang={'en'} suppressHydrationWarning> {/* suppressHydrationWarning for next-themes */}
      <body className={inter.className}>
        <ReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_API_KEY}
        >
          <ThemeProvider attribute="class" defaultTheme="dark">
            <ChakraProvider value={defaultSystem}>
              <ToastContainer />
              <Flex direction='column' flex='1' h='calc(100vh)'>
                <Navbar />
                {children}
              </Flex>
            </ChakraProvider>
          </ThemeProvider>
        </ReCaptchaProvider>
      </body>
      <GoogleTagManager gtmId='GTM-MR2PG3HB' />
    </html>
  )
}
