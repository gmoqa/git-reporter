'use client'

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  Text,
  Textarea,
  useClipboard,
  VStack,
} from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import ErrorAlert from '@/app/components/alerts/ErrorAlert'
import MarkdownPreview from '@uiw/react-markdown-preview'

export default function Page() {
  const COMMAND =
    'git --no-pager log --all --oneline --pretty=format:"%h %an %ad %s" --date=format-local:"%Y-%m-%d %H:%M:%S"'
  const { onCopy, hasCopied } = useClipboard(String(COMMAND))
  const [log, setLog] = useState('')
  const [dateFilter, setDateFilter] = useState('LAST_WEEK')
  const [formattedLog, setFormattedLog] = useState([])
  const [loading, setLoading] = useState(false)

  function returnBaseFilteredLog() {
    return formattedLog
      ?.filter((line) => !line.text.startsWith('Merge branch'))
      ?.filter((line) => !line.text.startsWith('Merged in'))
      ?.filter((line) => !line.text.startsWith('WIP'))
      ?.filter((line) => !line.text.startsWith('index'))
      ?.filter((line) => line.type)
      ?.filter((line) => line.scope)
      ?.filter((line) => line.subject)
  }

  const source = `## Changelog
  ### Summary
  **${returnBaseFilteredLog().length}** commits, **${returnBaseFilteredLog().filter((line) => line.type === 'feat').length}** features, **${returnBaseFilteredLog().filter((line) => line.type === 'fix').length}** fixes
    
   
  #### Features
  
  ${returnBaseFilteredLog()
    .filter((line) => line.type === 'feat')
    .map((line) => {
      return ` - **${line.type}** (${line.scope}): ${line.subject} **[(${line.hash})](#)**  \n`
    })
    .join('')}

  #### Fixes
  
  ${returnBaseFilteredLog()
    .filter((line) => line.type === 'fix')
    .map((line) => {
      return ` - **${line.type}** (${line.scope}): ${line.subject} **[(${line.hash})](#)**  \n`
    })
    .join('')}
`

  async function processLog() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const scopePattern = /\((.*?)\):/
        const dateTimePattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/
        const processedLog = log
          .trim()
          .split('\n')
          .map((line) => {
            const date = line.match(dateTimePattern)?.[0]
            const dateIndex = line.indexOf(date)
            const dateLastIndex = dateIndex + date?.length
            const hash = line.substring(0, 7)
            const author = line.substring(hash.length + 1, dateIndex - 1)
            const text = line.substring(dateLastIndex + 1)
            const scope = text.match(scopePattern)?.[1]
            const type = text.substring(0, text.indexOf(scope) - 1)
            const subject = text.split(': ')?.[1]
            return { hash, author, scope, type, date, subject, text }
          })
        setFormattedLog(processedLog)
        resolve()
      }, 1000)
    })
  }

  const handleClickFilterButton = () => {
    setFormattedLog((prev) => {
      prev.filter((line) => line.type === 'styles')
    })
  }

  const handleClickRunButton = () => {
    setLoading(true)
    processLog()
      .then(() => setLoading(false))
      .catch((e) => {
        console.error(e)
        setLoading(false)
        ErrorAlert({
          title: 'Error',
          description: 'An error occurred while processing the log',
        })
      })
  }

  function truncateString(string) {
    const length = 80
    if (string.length > length) {
      return string.substring(0, length - 3) + '...'
    } else {
      return string
    }
  }

  return (
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
      <VStack pt={6} spacing={4}>
        <VStack spacing={0}>
          <Box p={4} bgColor={'gray.900'} borderRadius={'lg'}>
            <HStack>
              <Text
                as='samp'
                color={'gray.400'}
                fontSize={['xs', 'sm']}
                fontWeight={'semibold'}
              >
                {COMMAND}
              </Text>
              <IconButton
                size={'sm'}
                borderRadius={'full'}
                _hover={{ bgColor: 'gray.700' }}
                color={'gray.300'}
                bgColor={'gray.800'}
                icon={<CopyIcon />}
                onClick={() => onCopy()}
              >
                {hasCopied ? 'URL copied!' : 'Copy URL'}
              </IconButton>
            </HStack>
          </Box>
          <Text mt={2} as='i' color={'gray.400'} fontSize={['xs', 'sm']}>
            Run this command on your proyect folder, and paste the output here
          </Text>
        </VStack>
        <Textarea
          rows={6}
          color={'gray.600'}
          bgColor={'gray.200'}
          placeholder='Paste output here'
          onChange={(e) => setLog(e.target.value)}
        />
        <Button
          isLoading={loading}
          width={'100%'}
          bgColor={'yellow.400'}
          color={'gray.700'}
          _hover={{ bgColor: 'yellow.200', color: 'gray.700' }}
          onClick={() => handleClickRunButton()}
        >
          Process
        </Button>
      </VStack>
      <Text mt={1} color={'gray.500'} fontSize={'xs'} textAlign={'center'}>
        We will never store your data. This tool runs 100% on the client side.
      </Text>

      {formattedLog.length > 0 && (
        <Box
          data-color-mode='light'
          mt={4}
          bgColor={'white'}
          p={4}
          borderRadius={'md'}
        >
          <MarkdownPreview
            source={source}
            rehypeRewrite={(node, index, parent) => {
              if (
                node.tagName === 'a' &&
                parent &&
                /^h(1|2|3|4|5|6)/.test(parent.tagName)
              ) {
                parent.children = parent.children.slice(1)
              }
            }}
          />
        </Box>
      )}
    </Flex>
  )
}
