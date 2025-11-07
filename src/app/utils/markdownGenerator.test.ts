import { describe, it, expect } from 'vitest'
import { generateMarkdown } from './markdownGenerator'
import type { GitCommit } from '@/types'

describe('markdownGenerator', () => {
  const createMockCommit = (
    type: string,
    scope?: string,
    subject = 'test subject'
  ): GitCommit => ({
    hash: 'abc123',
    author: 'Test Author',
    date: '2024-01-15 10:30:00',
    type: type as any,
    scope,
    subject,
    rawSubject: scope ? `${type}(${scope}): ${subject}` : `${type}: ${subject}`,
  })

  describe('generateMarkdown', () => {
    it('should generate markdown with features and fixes', () => {
      const filteredLog: GitCommit[] = [
        createMockCommit('feat', 'ui', 'add dark mode'),
        createMockCommit('fix', 'parser', 'handle edge case'),
      ]
      const feats = [filteredLog[0]]
      const fixes = [filteredLog[1]]

      const result = generateMarkdown(filteredLog, feats, fixes)

      expect(result).toContain('## Changelog')
      expect(result).toContain('### Summary')
      expect(result).toContain('**2** commits, **1** features, **1** fixes')
      expect(result).toContain('#### Features')
      expect(result).toContain('add dark mode')
      expect(result).toContain('#### Fixes')
      expect(result).toContain('handle edge case')
    })

    it('should show scope in features', () => {
      const feat = createMockCommit('feat', 'auth', 'add login')
      const result = generateMarkdown([feat], [feat], [])

      expect(result).toContain('**feat**(auth): add login')
    })

    it('should handle fixes without scope', () => {
      const fix = createMockCommit('fix', undefined, 'fix bug')
      const result = generateMarkdown([fix], [], [fix])

      expect(result).toContain('**fix**: fix bug')
      expect(result).not.toContain('()')
    })

    it('should handle empty features section', () => {
      const fix = createMockCommit('fix', 'parser', 'fix parser')
      const result = generateMarkdown([fix], [], [fix])

      expect(result).not.toContain('#### Features')
      expect(result).toContain('#### Fixes')
      expect(result).toContain('**1** commits, **0** features, **1** fixes')
    })

    it('should handle empty fixes section', () => {
      const feat = createMockCommit('feat', 'ui', 'add feature')
      const result = generateMarkdown([feat], [feat], [])

      expect(result).toContain('#### Features')
      expect(result).not.toContain('#### Fixes')
      expect(result).toContain('**1** commits, **1** features, **0** fixes')
    })

    it('should return message for empty input', () => {
      const result = generateMarkdown([], [], [])

      expect(result).toContain('## Changelog')
      expect(result).toContain('### Summary')
      expect(result).toContain('**0** commits')
    })

    it('should handle null inputs gracefully', () => {
      const result = generateMarkdown(null as any, null as any, null as any)

      expect(result).toContain('No commits to display')
    })

    it('should include commit hashes with links', () => {
      const feat = createMockCommit('feat', 'ui', 'add feature')
      const result = generateMarkdown([feat], [feat], [])

      expect(result).toContain('[(abc123)](#)')
    })

    it('should handle multiple features and fixes', () => {
      const commits: GitCommit[] = [
        createMockCommit('feat', 'ui', 'feature 1'),
        createMockCommit('feat', 'api', 'feature 2'),
        createMockCommit('fix', 'parser', 'fix 1'),
        createMockCommit('fix', 'ui', 'fix 2'),
        createMockCommit('docs', undefined, 'update docs'),
      ]
      const feats = commits.filter((c) => c.type === 'feat')
      const fixes = commits.filter((c) => c.type === 'fix')

      const result = generateMarkdown(commits, feats, fixes)

      expect(result).toContain('**5** commits, **2** features, **2** fixes')
      expect(result).toContain('feature 1')
      expect(result).toContain('feature 2')
      expect(result).toContain('fix 1')
      expect(result).toContain('fix 2')
    })
  })
})
