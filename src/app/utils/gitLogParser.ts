import { formatDate } from '@/app/utils/date'
import type { GitCommit, CommitType } from '@/types'

const scopePattern = /\((.*?)\):/
const typePattern = /^([^\(:]+)(?:\([^)]*\))?:/
const dateTimePattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/

interface ParsedLogItem {
  hash: string
  author: string
  scope?: string
  type?: string
  date?: string
  subject?: string
  text: string
}

export async function processLog(
  log: string,
  initialDate?: Date,
  endDate?: Date
): Promise<GitCommit[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const processedLog = log
        .trim()
        .split('\n')
        .map((line): ParsedLogItem => {
          const dateMatch = line.match(dateTimePattern)
          const date = dateMatch?.[0]
          const dateIndex = date ? line.indexOf(date) : -1
          const dateLastIndex = dateIndex + (date?.length || 0)
          const hash = line.substring(0, 7)
          const author = line.substring(hash.length + 1, dateIndex - 1)
          const text = line.substring(dateLastIndex + 1)
          const scope = text.match(scopePattern)?.[1]
          const type = text.match(typePattern)?.[1]
          const subject = text.split(': ')?.[1]

          return { hash, author, scope, type, date, subject, text }
        })
        .filter((logItem): logItem is ParsedLogItem & { date: string } => {
          if (!logItem.date) return false

          let passInitialDate = true
          let passEndDate = true
          const logDate = formatDate(logItem.date)

          if (initialDate) {
            passInitialDate = logDate >= formatDate(initialDate)
          }

          if (endDate) {
            passEndDate = logDate <= formatDate(endDate)
          }

          return passInitialDate && passEndDate
        })
        .map((logItem): GitCommit => ({
          hash: logItem.hash,
          author: logItem.author,
          date: logItem.date,
          scope: logItem.scope,
          type: (logItem.type as CommitType) || 'other',
          subject: logItem.subject || '',
          rawSubject: logItem.text,
        }))

      resolve(processedLog)
    }, 1000)
  })
}

export function filterLog(formattedLog: GitCommit[]): GitCommit[] {
  if (!formattedLog) return []

  return formattedLog
    .filter((line) => !line.rawSubject.startsWith('Merge branch'))
    .filter((line) => !line.rawSubject.startsWith('Merged in'))
    .filter((line) => !line.rawSubject.startsWith('WIP'))
    .filter((line) => !line.rawSubject.startsWith('index'))
    .filter((line) => line.type)
    .filter((line) => line.subject)
}

export function getFeatures(filteredLog: GitCommit[]): GitCommit[] {
  if (!filteredLog) return []
  return filteredLog.filter((line) => line.type === 'feat')
}

export function getFixes(filteredLog: GitCommit[]): GitCommit[] {
  if (!filteredLog) return []
  return filteredLog.filter((line) => line.type === 'fix')
}
