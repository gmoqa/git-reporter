import { BaseProvider } from './BaseProvider'
import type {
  User,
  Organization,
  Repository,
  Commit,
  CommitOptions,
} from '@/types'

interface GitLabUser {
  id: number
  username: string
  name: string
  email: string
}

interface GitLabGroup {
  id: number
  name: string
  path: string
  avatar_url?: string
}

interface GitLabProject {
  id: number
  name: string
  path_with_namespace: string
  default_branch: string
  description: string | null
  visibility: 'private' | 'internal' | 'public'
  namespace: {
    path: string
  }
}

interface GitLabCommit {
  id: string
  author_name: string
  author_email: string
  committed_date: string
  message: string
}

export class GitLabProvider extends BaseProvider {
  private baseURL = 'https://gitlab.com/api/v4'

  async _fetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getCurrentUser(): Promise<User> {
    const data: GitLabUser = await this._fetch('/user')
    return {
      id: data.id.toString(),
      name: data.name || data.username,
      email: data.email,
      login: data.username,
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    const data: GitLabGroup[] = await this._fetch(
      '/groups?min_access_level=10&per_page=100'
    )
    return data.map((group) => ({
      id: group.id.toString(),
      name: group.name,
      login: group.path,
      avatarUrl: group.avatar_url,
    }))
  }

  async getRepositories(owner?: string): Promise<Repository[]> {
    let endpoint = '/projects'
    if (owner) {
      // In GitLab, we need to get group projects
      const groups = await this.getOrganizations()
      const group = groups.find((g) => g.login === owner)
      if (group) {
        endpoint = `/groups/${group.id}/projects`
      }
    } else {
      endpoint = '/projects?membership=true'
    }

    const data: GitLabProject[] = await this._fetch(
      `${endpoint}?per_page=100&order_by=updated_at`
    )
    return data.map((project) => ({
      id: project.id.toString(),
      name: project.name,
      fullName: project.path_with_namespace,
      defaultBranch: project.default_branch || 'main',
      description: project.description || undefined,
      isPrivate: project.visibility === 'private',
      owner: project.namespace.path,
    }))
  }

  async searchRepositories(
    query: string,
    owner?: string
  ): Promise<Repository[]> {
    const params = new URLSearchParams({
      search: query,
      per_page: '50',
      membership: 'true',
    })

    const data: GitLabProject[] = await this._fetch(
      `/projects?${params.toString()}`
    )
    let results = data

    if (owner) {
      results = data.filter((project) =>
        project.path_with_namespace.startsWith(owner + '/')
      )
    }

    return results.map((project) => ({
      id: project.id.toString(),
      name: project.name,
      fullName: project.path_with_namespace,
      defaultBranch: project.default_branch || 'main',
      description: project.description || undefined,
      isPrivate: project.visibility === 'private',
      owner: project.namespace.path,
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
    if (branch) params.append('ref_name', branch)
    params.append('per_page', '100')

    // Get project by full path
    const encodedPath = encodeURIComponent(`${owner}/${repo}`)
    const data: GitLabCommit[] = await this._fetch(
      `/projects/${encodedPath}/repository/commits?${params.toString()}`
    )

    return data.map((commit) => ({
      hash: commit.id.substring(0, 7),
      author: commit.author_name,
      email: commit.author_email,
      date: commit.committed_date,
      message: commit.message,
    }))
  }
}
