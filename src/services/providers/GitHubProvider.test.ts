import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GitHubProvider } from './GitHubProvider'

// Mock fetch globally
global.fetch = vi.fn()

describe('GitHubProvider', () => {
  let provider: GitHubProvider
  const mockAccessToken = 'test-token-123'

  beforeEach(() => {
    provider = new GitHubProvider(mockAccessToken)
    vi.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should fetch and return current user', async () => {
      const mockUser = {
        id: 123,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

      const result = await provider.getCurrentUser()

      expect(result).toEqual({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        login: 'testuser',
      })
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      )
    })

    it('should handle user without name', async () => {
      const mockUser = {
        id: 123,
        login: 'testuser',
        name: null,
        email: 'test@example.com',
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

      const result = await provider.getCurrentUser()
      expect(result.name).toBe('testuser')
    })

    it('should throw error on failed request', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      })

      await expect(provider.getCurrentUser()).rejects.toThrow(
        'GitHub API error: Unauthorized'
      )
    })
  })

  describe('getOrganizations', () => {
    it('should fetch and return organizations', async () => {
      const mockOrgs = [
        {
          id: 1,
          login: 'org1',
          name: 'Organization 1',
          avatar_url: 'https://example.com/avatar1.png',
        },
        {
          id: 2,
          login: 'org2',
          name: null,
          avatar_url: 'https://example.com/avatar2.png',
        },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrgs,
      })

      const result = await provider.getOrganizations()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: '1',
        name: 'Organization 1',
        login: 'org1',
        avatarUrl: 'https://example.com/avatar1.png',
      })
      expect(result[1].name).toBe('org2') // Falls back to login
    })
  })

  describe('getRepositories', () => {
    it('should fetch user repos when no owner specified', async () => {
      const mockRepos = [
        {
          id: 1,
          name: 'repo1',
          full_name: 'user/repo1',
          default_branch: 'main',
          description: 'Test repo',
          private: false,
          owner: { login: 'user' },
        },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepos,
      })

      const result = await provider.getRepositories()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: '1',
        name: 'repo1',
        fullName: 'user/repo1',
        defaultBranch: 'main',
        description: 'Test repo',
        isPrivate: false,
        owner: 'user',
      })
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/repos'),
        expect.any(Object)
      )
    })

    it('should fetch specific owner repos when owner specified', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      await provider.getRepositories('testowner')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/testowner/repos'),
        expect.any(Object)
      )
    })
  })

  describe('searchRepositories', () => {
    it('should search repositories', async () => {
      const mockSearchResult = {
        items: [
          {
            id: 1,
            name: 'search-result',
            full_name: 'user/search-result',
            default_branch: 'main',
            description: 'Found repo',
            private: true,
            owner: { login: 'user' },
          },
        ],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResult,
      })

      const result = await provider.searchRepositories('search-term')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('search-result')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/repositories'),
        expect.any(Object)
      )
    })

    it('should include owner in search query when specified', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      await provider.searchRepositories('api', 'myorg')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api%20user%3Amyorg'),
        expect.any(Object)
      )
    })
  })

  describe('getCommits', () => {
    it('should fetch commits from repository', async () => {
      const mockCommits = [
        {
          sha: 'abc123def456',
          commit: {
            author: {
              name: 'John Doe',
              email: 'john@example.com',
              date: '2024-01-15T10:30:00Z',
            },
            message: 'feat: add feature',
          },
        },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommits,
      })

      const result = await provider.getCommits('owner', 'repo')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        hash: 'abc123d',
        author: 'John Doe',
        email: 'john@example.com',
        date: '2024-01-15T10:30:00Z',
        message: 'feat: add feature',
      })
    })

    it('should include query parameters when provided', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      await provider.getCommits('owner', 'repo', {
        since: '2024-01-01',
        until: '2024-01-31',
        branch: 'develop',
      })

      const fetchCall = (global.fetch as any).mock.calls[0][0]
      expect(fetchCall).toContain('since=2024-01-01')
      expect(fetchCall).toContain('until=2024-01-31')
      expect(fetchCall).toContain('sha=develop')
    })
  })
})
