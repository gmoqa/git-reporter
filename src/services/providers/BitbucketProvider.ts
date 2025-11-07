import { BaseProvider } from './BaseProvider'
import type {
  User,
  Organization,
  Repository,
  Commit,
  CommitOptions,
} from '@/types'

interface BitbucketUser {
  uuid: string
  username: string
  display_name: string
  email?: string
}

interface BitbucketWorkspace {
  uuid: string
  name: string
  slug: string
  links?: {
    avatar?: {
      href: string
    }
  }
}

interface BitbucketRepo {
  uuid: string
  name: string
  full_name: string
  mainbranch?: {
    name: string
  }
  description: string | null
  is_private: boolean
  owner: {
    username: string
  }
}

interface BitbucketCommit {
  hash: string
  author: {
    raw: string
    user?: {
      email: string
    }
  }
  date: string
  message: string
}

export class BitbucketProvider extends BaseProvider {
  private baseURL = 'https://api.bitbucket.org/2.0'

  async _fetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Bitbucket API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getCurrentUser(): Promise<User> {
    const data: BitbucketUser = await this._fetch('/user')
    return {
      id: data.uuid,
      name: data.display_name || data.username,
      email: data.email,
      login: data.username,
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    const data: { values: BitbucketWorkspace[] } = await this._fetch(
      '/workspaces?pagelen=100'
    )
    return data.values.map((workspace) => ({
      id: workspace.uuid,
      name: workspace.name,
      login: workspace.slug,
      avatarUrl: workspace.links?.avatar?.href,
    }))
  }

  async getRepositories(owner?: string): Promise<Repository[]> {
    let endpoint = '/repositories'
    if (owner) {
      endpoint = `/repositories/${owner}`
    } else {
      const user = await this.getCurrentUser()
      endpoint = `/repositories/${user.login}`
    }

    const data: { values: BitbucketRepo[] } = await this._fetch(
      `${endpoint}?pagelen=100&sort=-updated_on`
    )
    return data.values.map((repo) => ({
      id: repo.uuid,
      name: repo.name,
      fullName: repo.full_name,
      defaultBranch: repo.mainbranch?.name || 'main',
      description: repo.description || undefined,
      isPrivate: repo.is_private,
      owner: repo.owner.username,
    }))
  }

  async searchRepositories(
    query: string,
    owner?: string
  ): Promise<Repository[]> {
    const user = await this.getCurrentUser()
    const searchOwner = owner || user.login

    const data: { values: BitbucketRepo[] } = await this._fetch(
      `/repositories/${searchOwner}?q=name~"${encodeURIComponent(query)}"&pagelen=50`
    )

    return data.values.map((repo) => ({
      id: repo.uuid,
      name: repo.name,
      fullName: repo.full_name,
      defaultBranch: repo.mainbranch?.name || 'main',
      description: repo.description || undefined,
      isPrivate: repo.is_private,
      owner: repo.owner.username,
    }))
  }

  async getCommits(
    owner: string,
    repo: string,
    options: CommitOptions = {}
  ): Promise<Commit[]> {
    const { since, until, branch } = options
    const branchParam = branch || 'HEAD'

    const data: { values: BitbucketCommit[] } = await this._fetch(
      `/repositories/${owner}/${repo}/commits/${branchParam}?pagelen=100`
    )

    let commits = data.values.map((commit) => ({
      hash: commit.hash.substring(0, 7),
      author: commit.author.raw.split('<')[0].trim(),
      email:
        commit.author.raw.match(/<(.+)>/)?.[1] ||
        commit.author.user?.email ||
        '',
      date: commit.date,
      message: commit.message,
    }))

    // Filter by date if provided
    if (since || until) {
      commits = commits.filter((commit) => {
        const commitDate = new Date(commit.date)
        if (since && commitDate < new Date(since)) return false
        if (until && commitDate > new Date(until)) return false
        return true
      })
    }

    return commits
  }
}
