'use client'

import { Container, Flex, Heading, Text, VStack } from '@chakra-ui/react'

import { useState, type ChangeEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useReCaptcha } from 'next-recaptcha-v3'
import ErrorAlert from '@/app/components/alerts/ErrorAlert'
import { sendGTMEvent } from '@next/third-parties/google'
import { toaster } from '@/components/ui/toaster'
import Toolbar from '@/app/components/Toolbar'
import GitCommandDisplay from '@/app/components/GitCommandDisplay'
import LogInput from '@/app/components/LogInput'
import ChangelogPreview from '@/app/components/ChangelogPreview'
import RepositorySelector from '@/app/components/RepositorySelector'
import Footer from '@/app/components/Footer'
import {
  processLog,
  filterLog,
  getFeatures,
  getFixes,
} from './utils/gitLogParser'
import { generateMarkdown } from './utils/markdownGenerator'
import { GIT_LOG_COMMAND } from './constants'
import type { GitCommit, RepositoryInfo, Commit } from '@/types'

export default function Page() {
  // Auth session
  const { data: session } = useSession()

  // State for the Git log command and clipboard functionality
  const [hasCopied, setHasCopied] = useState(false)
  const onCopy = () => {
    navigator.clipboard.writeText(GIT_LOG_COMMAND)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  // State for the raw pasted Git log input
  const [log, setLog] = useState('')
  // State for the log after initial processing (parsing into structured objects)
  const [formattedLog, setFormattedLog] = useState<GitCommit[]>([])
  // State to manage the loading spinner during processing
  const [loading, setLoading] = useState(false)
  // State for the start date filter
  const [initialDate, setInitialDate] = useState<string | undefined>()
  // State for the end date filter
  const [endDate, setEndDate] = useState<string | undefined>()
  // State for selected repository
  const [selectedRepo, setSelectedRepo] = useState<RepositoryInfo | null>(null)

  // reCAPTCHA hook
  const { executeRecaptcha } = useReCaptcha()

  // Derived state: Filtered log based on keywords and commit types
  const filteredLog = filterLog(formattedLog)
  // Derived state: Extracted features from the filtered log
  const feats = getFeatures(filteredLog)
  // Derived state: Extracted fixes from the filtered log
  const fixes = getFixes(filteredLog)

  // Derived state: Markdown string generated for preview
  const source = generateMarkdown(filteredLog, feats, fixes)

  /**
   * Fetches commits from API for the selected repository
   */
  const fetchCommitsFromRepo = async (
    repoInfo: RepositoryInfo,
    sinceDate: string | undefined = undefined,
    untilDate: string | undefined = undefined
  ) => {
    setLoading(true)

    try {
      const params = new URLSearchParams({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
      })

      const since = sinceDate || initialDate
      const until = untilDate || endDate

      if (since) params.append('since', new Date(since).toISOString())
      if (until) params.append('until', new Date(until).toISOString())
      if (repoInfo.defaultBranch)
        params.append('branch', repoInfo.defaultBranch)

      const response = await fetch(`/api/repos/commits?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch commits')

      const commits: Commit[] = await response.json()

      // Convert API commits to log format
      const logString = commits
        .map(
          (c) =>
            `${c.hash} ${c.author} ${new Date(c.date).toISOString().replace('T', ' ').split('.')[0]} ${c.message.split('\n')[0]}`
        )
        .join('\n')

      setLog(logString)

      // Process the commits
      const processedOutput = await processLog(
        logString,
        since ? new Date(since) : undefined,
        until ? new Date(until) : undefined
      )
      setFormattedLog(processedOutput)

      toaster.create({
        title: 'Success',
        description: `Loaded ${commits.length} commits from ${repoInfo.fullName}`,
        type: 'success',
      })
    } catch (error) {
      console.error('Error fetching commits:', error)
      toaster.create({
        title: 'Error',
        description: 'Failed to fetch commits from repository',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles repository selection and fetches commits from API
   */
  const handleSelectRepository = async (repoInfo: RepositoryInfo) => {
    setSelectedRepo(repoInfo)
    await fetchCommitsFromRepo(repoInfo)
  }

  /**
   * Handles the processing of the raw Git log.
   * It calls the `processLog` utility function and updates the `formattedLog` state.
   * Manages loading state and displays an error alert if processing fails.
   */
  const handleProcessLoad = async () => {
    setLoading(true)
    try {
      const processedOutput = await processLog(
        log,
        initialDate ? new Date(initialDate) : undefined,
        endDate ? new Date(endDate) : undefined
      )
      setFormattedLog(processedOutput)
    } catch (error) {
      console.error('Error processing log:', error)
      ErrorAlert({
        title: 'Processing Error',
        description:
          'An error occurred while processing the Git log. Please check the console for details.',
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Validates the reCAPTCHA token with the backend.
   * @returns {Promise<boolean>} True if reCAPTCHA is valid, false otherwise.
   */
  const isValidRecaptcha = async (): Promise<boolean> => {
    // Skip reCAPTCHA in development
    if (process.env.NODE_ENV === 'development') return true

    // Execute reCAPTCHA to get a token
    const token = await executeRecaptcha('validate') // 'validate' is the action name
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        captchaToken: token,
      }),
    })

    return response?.status === 200
  }

  /**
   * Handles applying filters
   * Works for both manual log input and repository-based flow
   */
  const handleApplyFilters = async () => {
    if (session && selectedRepo) {
      // User is logged in and has selected a repo: refetch commits with filters
      await fetchCommitsFromRepo(selectedRepo)
    } else if (log) {
      // Manual input flow: reprocess existing log with filters
      await handleProcessLoad()
    }
  }

  /**
   * Handles the click event for the "Process" button.
   * It validates reCAPTCHA, sends a GTM event, and then calls `handleProcessLoad`.
   * Manages loading state and displays an error alert if any step fails.
   */
  const handleClickRunButton = async () => {
    setLoading(true) // Set loading true at the beginning of the operation
    try {
      const isRealUser = await isValidRecaptcha()
      if (isRealUser) {
        sendGTMEvent({ event: 'buttonClicked', value: 'click' })
        await handleProcessLoad() // Await completion if it's async, otherwise it's fine
      } else {
        // Handle invalid reCAPTCHA case, if user needs to be notified specifically
        ErrorAlert({
          title: 'Validation Failed',
          description: 'reCAPTCHA validation failed. Please try again.',
        })
        setLoading(false) // Ensure loading is false if reCAPTCHA fails early
      }
    } catch (error) {
      console.error('Error during button click processing:', error)
      ErrorAlert({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      })
      setLoading(false) // Ensure loading is reset in case of any error
    }
    // setLoading(false) is handled by handleProcessLoad's finally block if successful,
    // or here/above if reCAPTCHA fails or another error occurs.
  }

  return (
    <>
      <Flex
        as='main'
        role='main'
        direction='column'
        flex='1'
        px={8}
        py={2}
        bgColor={'gray.700'}
      >
        <VStack mt={4} gap={0}>
          <Heading as={'h1'} color={'white'}>
            Gain insights from your GIT history
          </Heading>
          <Text fontSize='xl' color={'gray.400'}>
            Unlock the power of your commit messages with Conventional Commits
          </Text>
          <Text color={'yellow.400'} fontSize={'sm'} fontWeight={'medium'}>
            You are not using conventional commits?{' '}
            <strong>
              <a
                href='https://www.conventionalcommits.org/en/v1.0.0/'
                target='_blank'
                rel='noopener noreferrer'
              >
                Check this
              </a>
            </strong>
          </Text>
        </VStack>
        <Container maxW='container.xl'>
          {session ? (
            /* Logged in: Show Repository Selector */
            <VStack pt={6} gap={4}>
              <Text fontSize='lg' color='gray.300' textAlign='center'>
                Select a repository to analyze its commit history
              </Text>
              <RepositorySelector onSelectRepository={handleSelectRepository} />
              {selectedRepo && (
                <Text fontSize='sm' color='yellow.400' fontWeight='medium'>
                  Selected: {selectedRepo.fullName}
                </Text>
              )}
            </VStack>
          ) : (
            /* Not logged in: Show manual input */
            <VStack pt={6} gap={4}>
              <GitCommandDisplay
                COMMAND={GIT_LOG_COMMAND}
                onCopy={onCopy}
                hasCopied={hasCopied}
              />
              <Text mt={2} as='i' color={'gray.300'} fontSize={['xs', 'sm']}>
                Run this command on your proyect folder, and paste the output
                here
              </Text>
              <LogInput
                loading={loading}
                onLogChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setLog(e.target.value)
                }
                onProcessClick={handleClickRunButton}
              />
            </VStack>
          )}
          <Text mt={2} color={'gray.300'} fontSize={'xs'} textAlign={'center'}>
            {session
              ? 'Your repository data is fetched directly from your provider'
              : 'We will never store your data. This tool runs 100% on the client side.'}
          </Text>
        </Container>

        {(formattedLog.length > 0 || initialDate || endDate) && (
          <Container maxW='container.xl'>
            <Toolbar
              setInitialDate={setInitialDate}
              setEndDate={setEndDate}
              handleFilterResults={handleApplyFilters}
            />
            <ChangelogPreview source={source} />
          </Container>
        )}
      </Flex>
      <Footer />
    </>
  )
}
