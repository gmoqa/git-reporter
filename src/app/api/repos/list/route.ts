import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { ProviderFactory } from '@/services/providers/ProviderFactory'
import type { ExtendedSession } from '@/types'

export async function GET(request: Request) {
  try {
    const session = (await auth()) as ExtendedSession | null

    if (!session || !session.provider || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner') ?? undefined
    const search = searchParams.get('search')

    const provider = ProviderFactory.createProvider(
      session.provider,
      session.accessToken
    )

    let repositories
    if (search) {
      repositories = await provider.searchRepositories(search, owner)
    } else {
      repositories = await provider.getRepositories(owner)
    }

    return NextResponse.json(repositories)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch repositories'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
