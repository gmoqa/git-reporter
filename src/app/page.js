'use client'

import {
  Container,
  Flex,
  Heading,
  Text,
  useClipboard,
  VStack,
} from '@chakra-ui/react'

import { useState } from 'react'
import { useReCaptcha } from 'next-recaptcha-v3'
import ErrorAlert from '@/app/components/alerts/ErrorAlert' // Assumed to be a toast/notification function
import { sendGTMEvent } from '@next/third-parties/google'
import Toolbar from '@/app/components/Toolbar'
import GitCommandDisplay from '@/app/components/GitCommandDisplay'
import LogInput from '@/app/components/LogInput'
import ChangelogPreview from '@/app/components/ChangelogPreview'
import Footer from '@/app/components/Footer'
import { processLog, filterLog, getFeatures, getFixes } from './utils/gitLogParser'
import { generateMarkdown } from './utils/markdownGenerator'
import { GIT_LOG_COMMAND } from './constants'

export default function Page() {
  // State for the Git log command and clipboard functionality
  const { onCopy, hasCopied } = useClipboard(String(GIT_LOG_COMMAND))

  // State for the raw pasted Git log input
  const [log, setLog] = useState('')
  // State for the log after initial processing (parsing into structured objects)
  const [formattedLog, setFormattedLog] = useState([])
  // State to manage the loading spinner during processing
  const [loading, setLoading] = useState(false)
  // State for the start date filter
  const [initialDate, setInitialDate] = useState()
  // State for the end date filter
  const [endDate, setEndDate] = useState()

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
   * Handles the processing of the raw Git log.
   * It calls the `processLog` utility function and updates the `formattedLog` state.
   * Manages loading state and displays an error alert if processing fails.
   */
  const handleProcessLoad = async () => {
    setLoading(true)
    try {
      const processedOutput = await processLog(log, initialDate, endDate)
      setFormattedLog(processedOutput)
    } catch (error) {
      console.error("Error processing log:", error)
      ErrorAlert({
        title: 'Processing Error',
        description: 'An error occurred while processing the Git log. Please check the console for details.',
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Validates the reCAPTCHA token with the backend.
   * @returns {Promise<boolean>} True if reCAPTCHA is valid, false otherwise.
   */
  const isValidRecaptcha = async () => {
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
      console.error("Error during button click processing:", error)
      ErrorAlert({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      })
      setLoading(false) // Ensure loading is reset in case of any error
    }
    // setLoading(false) is handled by handleProcessLoad's finally block if successful,
    // or here/above if reCAPTCHA fails or another error occurs.
  }

  // Utility function (could be moved to a utils file if used elsewhere)
  function truncateString(string) {
    const length = 80
    if (string.length > length) {
      return string.substring(0, length - 3) + '...'
    } else {
      return string
    }
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
        <VStack mt={4} spacing={0}>
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
              >
                Check this
              </a>
            </strong>
          </Text>
        </VStack>
        <Container maxW='container.xl'>
          <VStack pt={6} spacing={4}>
            <GitCommandDisplay COMMAND={GIT_LOG_COMMAND} onCopy={onCopy} hasCopied={hasCopied} />
            <Text mt={2} as='i' color={'gray.300'} fontSize={['xs', 'sm']}>
              Run this command on your proyect folder, and paste the output here
            </Text>
            <LogInput
              loading={loading}
              onLogChange={(e) => setLog(e.target.value)}
              onProcessClick={handleClickRunButton}
            />
          </VStack>
          <Text mt={2} color={'gray.300'} fontSize={'xs'} textAlign={'center'}>
            We will never store your data. This tool runs 100% on the client side.
          </Text>
        </Container>

        {(formattedLog.length > 0 || initialDate || endDate) && (
          <Container maxW='container.xl'>
            <Toolbar
              setInitialDate={setInitialDate}
              setEndDate={setEndDate}
              handleFilterResults={handleClickRunButton} // Toolbar also uses handleClickRunButton for filtering
            />
            <ChangelogPreview source={source} />
          </Container>
        )}
      </Flex>
      <Footer />
    </>
  )
}
