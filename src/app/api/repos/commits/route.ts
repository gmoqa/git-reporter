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
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')
    const since = searchParams.get('since')
    const until = searchParams.get('until')
    const branch = searchParams.get('branch')

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repo parameters are required' },
        { status: 400 }
      )
    }

    const provider = ProviderFactory.createProvider(
      session.provider,
      session.accessToken
    )

    const commits = await provider.getCommits(owner, repo, {
      since: since || undefined,
      until: until || undefined,
      branch: branch || undefined,
    })

    return NextResponse.json(commits)
  } catch (error) {
    console.error('Error fetching commits:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch commits'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
