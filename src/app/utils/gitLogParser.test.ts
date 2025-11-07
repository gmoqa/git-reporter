import { describe, it, expect } from 'vitest'
import { processLog, filterLog, getFeatures, getFixes } from './gitLogParser'
import type { GitCommit } from '@/types'

describe('gitLogParser', () => {
  describe('processLog', () => {
    it('should parse a valid git log entry', async () => {
      const log = 'a1b2c3d John Doe 2024-01-15 10:30:00 feat(ui): add dark mode'
      const result = await processLog(log)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        hash: 'a1b2c3d',
        author: 'John Doe',
        date: '2024-01-15 10:30:00',
        scope: 'ui',
        type: 'feat',
        subject: 'add dark mode',
        rawSubject: 'feat(ui): add dark mode',
      })
    })

    it('should parse multiple git log entries', async () => {
      const log = `a1b2c3d John Doe 2024-01-15 10:30:00 feat(ui): add dark mode
b2c3d4e Jane Smith 2024-01-16 11:45:00 fix(parser): handle edge case`

      const result = await processLog(log)

      expect(result).toHaveLength(2)
      expect(result[0].type).toBe('feat')
      expect(result[1].type).toBe('fix')
    })

    it('should handle commits without scope', async () => {
      const log = 'a1b2c3d John Doe 2024-01-15 10:30:00 feat: add feature'
      const result = await processLog(log)

      expect(result[0].scope).toBeUndefined()
      expect(result[0].subject).toBe('add feature')
    })

    it('should filter by date range', async () => {
      const log = `a1b2c3d John Doe 2024-01-15 10:30:00 feat: feature 1
b2c3d4e Jane Smith 2024-01-20 11:45:00 feat: feature 2
c3d4e5f Bob Johnson 2024-01-25 12:00:00 feat: feature 3`

      const result = await processLog(
        log,
        new Date('2024-01-18'),
        new Date('2024-01-22')
      )

      expect(result).toHaveLength(1)
      expect(result[0].hash).toBe('b2c3d4e')
    })

    it('should handle empty log', async () => {
      const result = await processLog('')
      expect(result).toHaveLength(0)
    })

    it('should handle commits with special characters', async () => {
      const log =
        'a1b2c3d John Doe 2024-01-15 10:30:00 feat(api): add "quotes" & symbols'
      const result = await processLog(log)

      expect(result[0].subject).toBe('add "quotes" & symbols')
    })
  })

  describe('filterLog', () => {
    const createMockCommit = (overrides: Partial<GitCommit>): GitCommit => ({
      hash: 'abc123',
      author: 'Test Author',
      date: '2024-01-15 10:30:00',
      type: 'feat',
      subject: 'test subject',
      rawSubject: 'feat: test subject',
      ...overrides,
    })

    it('should filter out merge commits', () => {
      const commits: GitCommit[] = [
        createMockCommit({ rawSubject: 'Merge branch main' }),
        createMockCommit({ rawSubject: 'feat: valid commit' }),
      ]

      const result = filterLog(commits)
      expect(result).toHaveLength(1)
      expect(result[0].rawSubject).toBe('feat: valid commit')
    })

    it('should filter out Merged in commits', () => {
      const commits: GitCommit[] = [
        createMockCommit({ rawSubject: 'Merged in feature/branch' }),
        createMockCommit({ rawSubject: 'feat: valid commit' }),
      ]

      const result = filterLog(commits)
      expect(result).toHaveLength(1)
    })

    it('should filter out WIP commits', () => {
      const commits: GitCommit[] = [
        createMockCommit({ rawSubject: 'WIP: work in progress' }),
        createMockCommit({ rawSubject: 'feat: valid commit' }),
      ]

      const result = filterLog(commits)
      expect(result).toHaveLength(1)
    })

    it('should filter out commits without type', () => {
      const commits: GitCommit[] = [
        createMockCommit({ type: undefined as any }),
        createMockCommit({ type: 'feat' }),
      ]

      const result = filterLog(commits)
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('feat')
    })

    it('should filter out commits without subject', () => {
      const commits: GitCommit[] = [
        createMockCommit({ subject: '' }),
        createMockCommit({ subject: 'valid subject' }),
      ]

      const result = filterLog(commits)
      expect(result).toHaveLength(1)
    })

    it('should handle empty array', () => {
      const result = filterLog([])
      expect(result).toHaveLength(0)
    })

    it('should handle null input gracefully', () => {
      const result = filterLog(null as any)
      expect(result).toHaveLength(0)
    })
  })

  describe('getFeatures', () => {
    const createMockCommit = (type: string): GitCommit => ({
      hash: 'abc123',
      author: 'Test Author',
      date: '2024-01-15 10:30:00',
      type: type as any,
      subject: 'test subject',
      rawSubject: `${type}: test subject`,
    })

    it('should extract only feat commits', () => {
      const commits: GitCommit[] = [
        createMockCommit('feat'),
        createMockCommit('fix'),
        createMockCommit('feat'),
        createMockCommit('docs'),
      ]

      const result = getFeatures(commits)
      expect(result).toHaveLength(2)
      expect(result.every((c) => c.type === 'feat')).toBe(true)
    })

    it('should handle empty array', () => {
      const result = getFeatures([])
      expect(result).toHaveLength(0)
    })

    it('should handle null input', () => {
      const result = getFeatures(null as any)
      expect(result).toHaveLength(0)
    })
  })

  describe('getFixes', () => {
    const createMockCommit = (type: string): GitCommit => ({
      hash: 'abc123',
      author: 'Test Author',
      date: '2024-01-15 10:30:00',
      type: type as any,
      subject: 'test subject',
      rawSubject: `${type}: test subject`,
    })

    it('should extract only fix commits', () => {
      const commits: GitCommit[] = [
        createMockCommit('feat'),
        createMockCommit('fix'),
        createMockCommit('fix'),
        createMockCommit('docs'),
      ]

      const result = getFixes(commits)
      expect(result).toHaveLength(2)
      expect(result.every((c) => c.type === 'fix')).toBe(true)
    })

    it('should handle empty array', () => {
      const result = getFixes([])
      expect(result).toHaveLength(0)
    })

    it('should handle null input', () => {
      const result = getFixes(null as any)
      expect(result).toHaveLength(0)
    })
  })
})
