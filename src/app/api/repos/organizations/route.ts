import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ProviderFactory } from '@/services/providers/ProviderFactory'
import type { ExtendedSession } from '@/types'

export async function GET() {
  try {
    const session = (await auth()) as ExtendedSession | null

    if (!session || !session.provider || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const provider = ProviderFactory.createProvider(
      session.provider,
      session.accessToken
    )

    const organizations = await provider.getOrganizations()
    const currentUser = await provider.getCurrentUser()

    // Include current user as an option
    const options = [
      {
        id: currentUser.id,
        name: currentUser.name,
        login: currentUser.login,
        isUser: true,
      },
      ...organizations,
    ]

    return NextResponse.json(options)
  } catch (error) {
    console.error('Error fetching organizations:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch organizations'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
