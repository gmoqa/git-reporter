import type {
  IProvider,
  User,
  Organization,
  Repository,
  Commit,
  CommitOptions,
} from '@/types'

/**
 * Base Provider Interface
 * All provider implementations must extend this class
 */
export abstract class BaseProvider implements IProvider {
  protected accessToken: string

  constructor(accessToken: string) {
    if (new.target === BaseProvider) {
      throw new TypeError('Cannot construct BaseProvider instances directly')
    }
    this.accessToken = accessToken
  }

  /**
   * Get user's organizations
   */
  abstract getOrganizations(): Promise<Organization[]>

  /**
   * Get repositories for a user or organization
   */
  abstract getRepositories(owner?: string): Promise<Repository[]>

  /**
   * Search repositories
   */
  abstract searchRepositories(
    query: string,
    owner?: string
  ): Promise<Repository[]>

  /**
   * Get commits from a repository
   */
  abstract getCommits(
    owner: string,
    repo: string,
    options?: CommitOptions
  ): Promise<Commit[]>

  /**
   * Get authenticated user info
   */
  abstract getCurrentUser(): Promise<User>
}
