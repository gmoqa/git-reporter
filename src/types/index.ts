// ==========================================
// Git & Commit Types
// ==========================================

export interface GitCommit {
  hash: string
  author: string
  date: string
  scope?: string
  type: CommitType
  subject: string
  rawSubject: string
}

export type CommitType =
  | 'feat'
  | 'fix'
  | 'docs'
  | 'style'
  | 'refactor'
  | 'test'
  | 'chore'
  | 'perf'
  | 'other'

// ==========================================
// Provider Types
// ==========================================

export interface User {
  id: string
  name: string
  email?: string
  login: string
  avatarUrl?: string
}

export interface Organization {
  id: string
  name: string
  login: string
  avatarUrl?: string
  isUser?: boolean
}

export interface Repository {
  id: string
  name: string
  fullName: string
  owner: string
  defaultBranch: string
  description?: string
  isPrivate: boolean
}

export interface Commit {
  hash: string
  author: string
  email: string
  date: string
  message: string
}

export interface CommitOptions {
  since?: string
  until?: string
  branch?: string
}

// ==========================================
// Provider Interface
// ==========================================

export interface IProvider {
  getCurrentUser(): Promise<User>
  getOrganizations(): Promise<Organization[]>
  getRepositories(owner?: string): Promise<Repository[]>
  searchRepositories(query: string, owner?: string): Promise<Repository[]>
  getCommits(owner: string, repo: string, options?: CommitOptions): Promise<Commit[]>
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiError {
  error: string
}

export interface ApiOrganizationsResponse extends Array<Organization> {}

export interface ApiRepositoriesResponse extends Array<Repository> {}

export interface ApiCommitsResponse extends Array<Commit> {}

// ==========================================
// Component Props Types
// ==========================================

export interface RepositoryInfo {
  owner: string
  repo: string
  fullName: string
  defaultBranch: string
}

export interface RepositorySelectorProps {
  onSelectRepository: (repoInfo: RepositoryInfo) => void
}

export interface GitCommandDisplayProps {
  COMMAND: string
  onCopy: () => void
  hasCopied: boolean
}

export interface LogInputProps {
  loading: boolean
  onLogChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onProcessClick: () => void
}

export interface ChangelogPreviewProps {
  source: string
}

export interface ToolbarProps {
  setInitialDate: (date: Date | undefined) => void
  setEndDate: (date: Date | undefined) => void
  handleFilterResults: () => void
}

export interface AuthButtonProps {
  provider: 'github' | 'gitlab' | 'bitbucket'
}

export interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

// ==========================================
// Session Types
// ==========================================

export interface SessionUser {
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface ExtendedSession {
  user?: SessionUser
  accessToken?: string
  provider?: 'github' | 'gitlab' | 'bitbucket'
  expires: string
}

// ==========================================
// Utility Function Types
// ==========================================

export type ProcessLogFunction = (
  log: string,
  initialDate?: Date,
  endDate?: Date
) => Promise<GitCommit[]>

export type FilterLogFunction = (formattedLog: GitCommit[]) => GitCommit[]

export type GetFeaturesFunction = (filteredLog: GitCommit[]) => GitCommit[]

export type GetFixesFunction = (filteredLog: GitCommit[]) => GitCommit[]

export type GenerateMarkdownFunction = (
  filteredLog: GitCommit[],
  feats: GitCommit[],
  fixes: GitCommit[]
) => string
