import { Flex } from '@chakra-ui/react'
import { GoogleTagManager } from '@next/third-parties/google'
import { ReCaptchaProvider } from 'next-recaptcha-v3'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Provider } from '@/components/ui/provider'
import { Toaster } from '@/components/ui/toaster'
import SessionProvider from '@/app/components/SessionProvider'
import Navbar from '@/app/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'git reporter',
  description: 'Gain insights from your GIT history',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang={'en'} suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ReCaptchaProvider
            reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_API_KEY}
          >
            <Provider>
              <Flex direction='column' flex='1' h='calc(100vh)'>
                <Navbar />
                {children}
              </Flex>
              <Toaster />
            </Provider>
          </ReCaptchaProvider>
        </SessionProvider>
      </body>
      <GoogleTagManager gtmId='GTM-MR2PG3HB' />
    </html>
  )
}
