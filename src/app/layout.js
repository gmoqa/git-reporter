import { ChakraProvider, ColorModeScript, Flex } from '@chakra-ui/react'

import Navbar from '@/app/components/Navbar'
import Head from 'next/head'

export default async function RootLayout({ children }) {
  return (
    <html>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l] = w[l] || [];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-MR2PG3HB')`,
          }}
        />
      </Head>
      <body>
        <ColorModeScript initialColorMode={'dark'} />
        <ChakraProvider>
          <Flex direction='column' flex='1' h='calc(100vh)'>
            <Navbar />
            {children}
          </Flex>
        </ChakraProvider>
      </body>
      <noscript>
        <iframe
          src='https://www.googletagmanager.com/ns.html?id=GTM-MR2PG3HB'
          height='0'
          width='0'
          style='display:none;visibility:hidden'
        ></iframe>
      </noscript>
    </html>
  )
}
