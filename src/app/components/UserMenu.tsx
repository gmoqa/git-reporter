'use client'

import { Avatar } from '@/components/ui/avatar'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { signOut } from 'next-auth/react'
import { FaGithub, FaGitlab, FaBitbucket } from 'react-icons/fa'
import type { ExtendedSession } from '@/types'
import type { ReactNode } from 'react'

interface UserMenuProps {
  session: ExtendedSession
}

export default function UserMenu({ session }: UserMenuProps) {
  const getProviderIcon = (): ReactNode => {
    switch (session?.provider) {
      case 'github':
        return <FaGithub />
      case 'gitlab':
        return <FaGitlab />
      case 'bitbucket':
        return <FaBitbucket />
      default:
        return null
    }
  }

  const getProviderName = (): string => {
    switch (session?.provider) {
      case 'github':
        return 'GitHub'
      case 'gitlab':
        return 'GitLab'
      case 'bitbucket':
        return 'Bitbucket'
      default:
        return ''
    }
  }

  return (
    <HStack gap={3}>
      <VStack gap={0} alignItems='flex-end'>
        <Text fontSize='sm' fontWeight='medium' color='white'>
          {session?.user?.name}
        </Text>
        <HStack gap={1}>
          {getProviderIcon()}
          <Text fontSize='xs' color='gray.400'>
            {getProviderName()}
          </Text>
        </HStack>
      </VStack>
      <Avatar
        name={session?.user?.name || undefined}
        src={session?.user?.image || undefined}
        size='sm'
      />
      <Button
        onClick={() => signOut({ callbackUrl: '/' })}
        size='sm'
        variant='ghost'
        colorPalette='red'
      >
        Logout
      </Button>
    </HStack>
  )
}
