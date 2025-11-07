import { BaseProvider } from './BaseProvider'
import type {
  User,
  Organization,
  Repository,
  Commit,
  CommitOptions,
} from '@/types'

interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
}

interface GitHubOrg {
  id: number
  name: string | null
  login: string
  avatar_url: string
}

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  default_branch: string
  description: string | null
  private: boolean
  owner: {
    login: string
  }
}

interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
}

export class GitHubProvider extends BaseProvider {
  private baseURL = 'https://api.github.com'

  async _fetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getCurrentUser(): Promise<User> {
    const data: GitHubUser = await this._fetch('/user')
    return {
      id: data.id.toString(),
      name: data.name || data.login,
      email: data.email || undefined,
      login: data.login,
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    const data: GitHubOrg[] = await this._fetch('/user/orgs')
    return data.map((org) => ({
      id: org.id.toString(),
      name: org.name || org.login,
      login: org.login,
      avatarUrl: org.avatar_url,
    }))
  }

  async getRepositories(owner?: string): Promise<Repository[]> {
    let endpoint = '/user/repos'
    if (owner) {
      endpoint = `/users/${owner}/repos`
    }

    const data: GitHubRepo[] = await this._fetch(
      `${endpoint}?per_page=100&sort=updated`
    )
    return data.map((repo) => ({
      id: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      defaultBranch: repo.default_branch || 'main',
      description: repo.description || undefined,
      isPrivate: repo.private,
      owner: repo.owner.login,
    }))
  }

  async searchRepositories(
    query: string,
    owner?: string
  ): Promise<Repository[]> {
    let searchQuery = query
    if (owner) {
      searchQuery = `${query} user:${owner}`
    }

    const data: { items: GitHubRepo[] } = await this._fetch(
      `/search/repositories?q=${encodeURIComponent(searchQuery)}&per_page=50`
    )
    return data.items.map((repo) => ({
      id: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      defaultBranch: repo.default_branch || 'main',
      description: repo.description || undefined,
      isPrivate: repo.private,
      owner: repo.owner.login,
    }))
  }

  async getCommits(
    owner: string,
    repo: string,
    options: CommitOptions = {}
  ): Promise<Commit[]> {
    const { since, until, branch } = options
    const params = new URLSearchParams()

    if (since) params.append('since', since)
    if (until) params.append('until', until)
    if (branch) params.append('sha', branch)
    params.append('per_page', '100')

    const data: GitHubCommit[] = await this._fetch(
      `/repos/${owner}/${repo}/commits?${params.toString()}`
    )

    return data.map((commit) => ({
      hash: commit.sha.substring(0, 7),
      author: commit.commit.author.name,
      email: commit.commit.author.email,
      date: commit.commit.author.date,
      message: commit.commit.message,
    }))
  }
}
