'use client'

import { Button, HStack, Spacer, Text } from '@chakra-ui/react'
import { FaGithub } from 'react-icons/fa'
import Link from 'next/link'

export default function Navbar() {
  return (
    <HStack px={8} py={4} bgColor={'gray.900'}>
      <HStack spacing={0.5}>
        <Text fontSize={['xl', '2xl']} fontWeight={'bold'} color={'yellow.400'}>
          git
        </Text>
        <Text fontSize={['xl', '2xl']} fontWeight={'bold'} color={'gray.200'}>
          reporter
        </Text>
      </HStack>
      <Spacer />
      <Link href='https://github.com/gmoqa/git-reporter' passHref target={'_blank'}>
        <Button leftIcon={<FaGithub />} size={'sm'}>
          Star on GitHub
        </Button>
      </Link>
    </HStack>
  )
}
