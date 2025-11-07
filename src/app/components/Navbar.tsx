'use client'

import { Button, HStack, Spacer, Text, Stack } from '@chakra-ui/react'
import { FaGithub, FaGitlab, FaBitbucket } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import AuthButton from './AuthButton'
import UserMenu from './UserMenu'
import type { ExtendedSession } from '@/types'

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <HStack px={8} py={4} bgColor={'gray.900'}>
      <HStack gap={0.5}>
        <Text fontSize={['xl', '2xl']} fontWeight={'bold'} color={'yellow.400'}>
          git
        </Text>
        <Text fontSize={['xl', '2xl']} fontWeight={'bold'} color={'gray.200'}>
          reporter
        </Text>
      </HStack>
      <Spacer />

      {status === 'loading' ? (
        <Text fontSize='sm' color='gray.400'>
          Loading...
        </Text>
      ) : session ? (
        <UserMenu session={session as ExtendedSession} />
      ) : (
        <Stack direction={{ base: 'column', md: 'row' }} gap={2}>
          <AuthButton provider='github' icon={<FaGithub />}>
            GitHub
          </AuthButton>
          <AuthButton provider='gitlab' icon={<FaGitlab />}>
            GitLab
          </AuthButton>
          <AuthButton provider='bitbucket' icon={<FaBitbucket />}>
            Bitbucket
          </AuthButton>
        </Stack>
      )}

      <Link
        href='https://github.com/gmoqa/git-reporter'
        passHref
        target={'_blank'}
      >
        <Button size={'sm'} variant='ghost'>
          <FaGithub />
          Star on GitHub
        </Button>
      </Link>
    </HStack>
  )
}
