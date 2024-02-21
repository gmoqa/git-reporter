'use client'

import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Stack,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Textarea,
  Tfoot,
  Th,
  Thead,
  Tr,
  useClipboard,
  VStack,
} from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import dayjs from 'dayjs'

export default function Page() {
  const COMMAND =
    'git --no-pager log --all --oneline --pretty=format:"%h %an %ad %s" --date=format-local:"%Y-%m-%d %H:%M:%S"'
  const { onCopy, hasCopied } = useClipboard(String(COMMAND))
  const [log, setLog] = useState(null)
  const [formattedLog, setFormattedLog] = useState(null)

  const handleClickRunButton = () => {
    const scopePattern = /\((.*?)\):/
    const dateTimePattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/
    const result = log
      .trim()
      .split('\n')
      .map((line) => {
        const date = line.match(dateTimePattern)?.[0]
        const dateIndex = line.indexOf(date)
        const dateLastIndex = dateIndex + date.length
        const hash = line.substring(0, 7)
        const author = line.substring(hash.length + 1, dateIndex - 1)
        const text = line.substring(dateLastIndex + 1)
        const scope = text.match(scopePattern)?.[1]
        const type = text.substring(0, text.indexOf(scope) - 1)
        const subject = text.split(': ')?.[1]
        return { hash, author, scope, type, date, subject, text }
      })
    setFormattedLog(result)
  }

  function truncateString(string) {
    const length = 80
    if (string.length > length) {
      return string.substring(0, length - 3) + '...'
    } else {
      return string
    }
  }

  const stats = [
    {
      label: 'FEATURES',
      value: formattedLog
        ?.filter((line) => !line.text.startsWith('Merge branch'))
        ?.filter((line) => !line.text.startsWith('Merged in'))
        ?.filter((line) => !line.text.startsWith('WIP'))
        ?.filter((line) => !line.text.startsWith('index'))
        ?.filter((line) => line.type)
        ?.filter((line) => line.scope)
        ?.filter((line) => line.subject)
        ?.filter((line) => line.type === 'feat').length,
    },
    {
      label: 'FIXES',
      value: formattedLog
        ?.filter((line) => !line.text.startsWith('Merge branch'))
        ?.filter((line) => !line.text.startsWith('Merged in'))
        ?.filter((line) => !line.text.startsWith('WIP'))
        ?.filter((line) => !line.text.startsWith('index'))
        ?.filter((line) => line.type)
        ?.filter((line) => line.scope)
        ?.filter((line) => line.subject)
        ?.filter((line) => line.type === 'fix').length,
    },
  ]

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
          <a
            href='https://www.conventionalcommits.org/en/v1.0.0/'
            target='_blank'
          >
            Check this
          </a>
        </Text>
      </VStack>
      <VStack pt={6} spacing={4}>
        <VStack spacing={0}>
          <Box p={4} bgColor={'gray.900'} borderRadius={'lg'}>
            <HStack>
              <Text as='samp' color={'gray.300'} fontSize={['xs', 'sm']}>
                {COMMAND}
              </Text>
              <IconButton
                size={'sm'}
                borderRadius={'full'}
                _hover={{ bgColor: 'gray.700' }}
                color={'gray.500'}
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
          width={'100%'}
          bgColor={'yellow.400'}
          color={'gray.700'}
          _hover={{ bgColor: 'yellow.500', color: 'white' }}
          onClick={() => handleClickRunButton()}
        >
          Process
        </Button>
      </VStack>
      <Text mt={1} color={'gray.500'} fontSize={'xs'} textAlign={'center'}>
        We will never store your data. This tool runs 100% on the client side.
      </Text>

      {formattedLog && (
        <Box mt={4} bgColor={'white'} p={4} borderRadius={'md'} mb={20}>
          <Tabs>
            <TabList>
              <Tab color={'blue.500'}>Log</Tab>
              <Tab color={'blue.500'}>Changelog</Tab>
              <Tab color={'blue.500'}>Stats</Tab>
            </TabList>
            <TabPanels>
              <TabPanel pb={2} px={0}>
                <TableContainer>
                  <Table size='sm'>
                    <Thead>
                      <Tr>
                        <Th>COMMIT</Th>
                        <Th>AUTHOR</Th>
                        <Th>TYPE(SCOPE): SUBJECT </Th>
                        <Th isNumeric>DATE</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {formattedLog
                        ?.filter(
                          (line) => !line.text.startsWith('Merge branch')
                        )
                        ?.filter((line) => !line.text.startsWith('Merged in'))
                        ?.filter((line) => !line.text.startsWith('WIP'))
                        ?.filter((line) => !line.text.startsWith('index'))
                        ?.filter((line) => line.type)
                        ?.filter((line) => line.scope)
                        ?.filter((line) => line.subject)
                        ?.map((line) => {
                          console.log(line)
                          return (
                            <Tr key={line.hash}>
                              <Td>
                                <Text color={'blue.600'} fontWeight={'medium'}>
                                  {line.hash}
                                </Text>
                              </Td>
                              <Td>
                                <Text color={'gray.700'} fontWeight={'medium'}>
                                  {line.author}
                                </Text>
                              </Td>
                              <Td>
                                <HStack spacing={0.5}>
                                  <Text
                                    fontWeight={'semibold'}
                                    fontSize={'xs'}
                                    color={'gray.600'}
                                  >
                                    {line.type.toLowerCase()}
                                  </Text>
                                  <Text
                                    fontWeight={'semibold'}
                                    fontSize={'xs'}
                                    color={'blue.600'}
                                  >
                                    ({line.scope.toLowerCase()}) :
                                  </Text>
                                  <Text
                                    as={'i'}
                                    fontSize={'sm'}
                                    color={'gray.600'}
                                  >
                                    {truncateString(line.subject.toLowerCase())}
                                  </Text>
                                </HStack>
                              </Td>
                              <Td isNumeric>
                                <Text color={'gray.600'} fontWeight={'medium'}>
                                  {dayjs(line.date).format('DD-MM-YYYY')}
                                </Text>
                              </Td>
                            </Tr>
                          )
                        })}
                    </Tbody>
                    <Tfoot>
                      <Tr>
                        <Th>COMMIT</Th>
                        <Th>AUTHOR</Th>
                        <Th>TYPE(SCOPE):SUBJECT</Th>
                        <Th isNumeric>DATE</Th>
                      </Tr>
                    </Tfoot>
                  </Table>
                </TableContainer>
              </TabPanel>
              <TabPanel>
                <Text fontWeight={'semibold'} color={'gray.700'}>
                  Fixes
                </Text>
                <VStack mt={2} align={'left'} spacing={0}>
                  {formattedLog
                    ?.filter((line) => !line.text.startsWith('Merge branch'))
                    ?.filter((line) => !line.text.startsWith('Merged in'))
                    ?.filter((line) => !line.text.startsWith('WIP'))
                    ?.filter((line) => !line.text.startsWith('index'))
                    ?.filter((line) => line.type)
                    ?.filter((line) => line.scope)
                    ?.filter((line) => line.subject)
                    ?.filter((line) => line.type === 'fix')
                    ?.slice(0, 10)
                    ?.map((line) => {
                      return (
                        <HStack key={line.hash} spacing={1}>
                          <Text color={'blue.500'} fontWeight={'medium'}>
                            {line.hash}
                          </Text>
                          <HStack spacing={0}>
                            <Text color={'gray.800'} fontWeight={'medium'}>
                              {line.type}
                            </Text>
                            <Text color={'gray.500'} fontWeight={'medium'}>
                              ({line.scope})
                            </Text>
                            <Text color={'gray.600'} fontWeight={'medium'}>
                              : {line.subject}
                            </Text>
                          </HStack>
                        </HStack>
                      )
                    })}
                </VStack>
                <Text mt={4} fontWeight={'semibold'} color={'gray.700'}>
                  Features
                </Text>
                <VStack mt={2} align={'left'} spacing={0}>
                  {formattedLog
                    ?.filter((line) => !line.text.startsWith('Merge branch'))
                    ?.filter((line) => !line.text.startsWith('Merged in'))
                    ?.filter((line) => !line.text.startsWith('WIP'))
                    ?.filter((line) => !line.text.startsWith('index'))
                    ?.filter((line) => line.type)
                    ?.filter((line) => line.scope)
                    ?.filter((line) => line.subject)
                    ?.filter((line) => line.type === 'feat')
                    .slice(0, 10)
                    ?.map((line) => {
                      return (
                        <HStack key={line.hash} spacing={1}>
                          <Text color={'blue.500'} fontWeight={'medium'}>
                            {line.hash}
                          </Text>
                          <Text color={'gray.700'} fontWeight={'medium'}>
                            {line.type}
                          </Text>
                          <Text color={'gray.600'} fontWeight={'medium'}>
                            ({line.scope})
                          </Text>
                          <Text color={'gray.600'} fontWeight={'medium'}>
                            {line.subject}
                          </Text>
                        </HStack>
                      )
                    })}
                </VStack>
              </TabPanel>
              <TabPanel>
                <SimpleGrid
                  columns={{ base: 1, md: 3 }}
                  gap={{ base: '5', md: '6' }}
                >
                  {stats.map(({ label, value }) => (
                    <Box
                      mb={60}
                      key={label}
                      px={{ base: '4', md: '6' }}
                      py={{ base: '5', md: '6' }}
                      bg='bg.surface'
                      borderRadius='lg'
                      boxShadow='sm'
                    >
                      <Stack>
                        <Text textStyle='sm' color='gray.800'>
                          {label}
                        </Text>
                        <Heading
                          size={{ base: 'sm', md: 'md' }}
                          color='gray.800'
                        >
                          {value}
                        </Heading>
                      </Stack>
                    </Box>
                  ))}
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Flex>
  )
}
