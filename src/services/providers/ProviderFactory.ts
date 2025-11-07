import { GitHubProvider } from './GitHubProvider'
import { GitLabProvider } from './GitLabProvider'
import { BitbucketProvider } from './BitbucketProvider'
import type { IProvider } from '@/types'

type ProviderName = 'github' | 'gitlab' | 'bitbucket'

/**
 * Factory to create the appropriate provider instance
 */
export class ProviderFactory {
  static createProvider(
    providerName: ProviderName,
    accessToken: string
  ): IProvider {
    switch (providerName) {
      case 'github':
        return new GitHubProvider(accessToken)
      case 'gitlab':
        return new GitLabProvider(accessToken)
      case 'bitbucket':
        return new BitbucketProvider(accessToken)
      default:
        throw new Error(`Unsupported provider: ${providerName}`)
    }
  }
}
