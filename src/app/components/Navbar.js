'use client'

import { HStack, Text } from '@chakra-ui/react'

export default function Navbar() {
  return (
    <HStack px={8} py={4} bgColor={'gray.900'}>
      <HStack spacing={1}>
        <Text fontSize={['xl', '2xl']} fontWeight={'bold'} color={'#ede482'}>
          git
        </Text>
        <Text fontSize={['xl', '2xl']} fontWeight={'bold'} color={'gray.200'}>
          tool
        </Text>
      </HStack>
    </HStack>
  )
}
