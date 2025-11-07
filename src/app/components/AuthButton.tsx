'use client'

import { Button } from '@chakra-ui/react'
import { signIn } from 'next-auth/react'
import type { ReactNode } from 'react'

interface AuthButtonProps {
  provider: string
  icon: ReactNode
  children: ReactNode
}

export default function AuthButton({
  provider,
  icon,
  children,
}: AuthButtonProps) {
  const handleSignIn = async () => {
    await signIn(provider, { callbackUrl: '/' })
  }

  return (
    <Button
      onClick={handleSignIn}
      size='sm'
      colorPalette='gray'
      variant='outline'
    >
      {icon}
      {children}
    </Button>
  )
}
