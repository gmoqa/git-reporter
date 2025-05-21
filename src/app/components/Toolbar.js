'use client'

import {
  Box,
  Button,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from '@chakra-ui/react'
import { CalendarIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { FaFilter } from 'react-icons/fa'
import { formatDate } from '@/app/utils/date'
import { formatMarkdown } from '@/app/utils/markdownGenerator'

export default function Toolbar({
  setInitialDate,
  setEndDate,
  handleFilterResults,
  markdownSource,
}) {
  const [filter, setFilter] = useState(null)
  const toast = useToast()

  const handleCopy = async (format) => {
    try {
      const formattedText = formatMarkdown(markdownSource, format)
      await navigator.clipboard.writeText(formattedText)
      toast({
        title: 'Copied to clipboard!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast({
        title: 'Failed to copy',
        description: 'Could not copy text to clipboard.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const updateFilter = (newFilter) => {
    const today = new Date()
    let initialDay

    if (newFilter === 'WEEK') {
      initialDay = new Date(today).setDate(today.getDate() - 7)
    }

    if (newFilter === '2_WEEKS') {
      initialDay = new Date(today).setDate(today.getDate() - 14)
    }

    if (newFilter === 'MONTH') {
      initialDay = new Date(today).setMonth(today.getMonth() - 1)
    }

    handleInitialDateChange(initialDay)
    handleEndDateChange(today)
    setFilter(newFilter)
  }

  const handleInitialDateChange = (value) => {
    if (value) {
      setInitialDate(formatDate(value))
    }
  }

  const handleEndDateChange = (value) => {
    if (value) {
      setEndDate(formatDate(value))
    }
  }

  return (
    <Box bgColor={'gray.600'} py={2} px={4} borderRadius={'lg'} mt={2}>
      <HStack>
        <CalendarIcon color={'gray.400'} mr={2} />
        <RadioGroup
          mt={1}
          onChange={updateFilter}
          value={filter}
          color={'gray.300'}
          fontWeight={'medium'}
          colorScheme={'yellow'}
        >
          <Stack direction='row'>
            <Radio value='WEEK'>Week</Radio>
            <Radio value='2_WEEKS'>2 Weeks</Radio>
            <Radio value='MONTH'>Month </Radio>
            <Radio value='CUSTOM'>Custom</Radio>
          </Stack>
        </RadioGroup>
        {filter === 'CUSTOM' && (
          <HStack>
            <Input
              placeholder='Start Date'
              borderRadius={'md'}
              borderColor={'gray.500'}
              name='initial'
              onChange={(e) => handleInitialDateChange(e.target.value)}
              size='sm'
              type='date'
              color='gray.400'
            />
            <Input
              placeholder='End Date'
              name='end'
              borderRadius={'md'}
              borderColor={'gray.500'}
              onChange={(e) => handleEndDateChange(e.target.value)}
              size='sm'
              type='date'
              color='gray.400'
            />
          </HStack>
        )}
        <Spacer />
        <Button
          size={'sm'}
          borderRadius={'md'}
          bgColor={'yellow.400'}
          color={'gray.700'}
          _hover={{ bgColor: 'yellow.200', color: 'gray.700' }}
          leftIcon={<FaFilter />}
          onClick={() => handleFilterResults(filter)}
        >
          Filter
        </Button>
        <Menu>
          <MenuButton
            as={Button}
            size={'sm'}
            borderRadius={'md'}
            bgColor={'yellow.400'}
            color={'gray.700'}
            _hover={{ bgColor: 'yellow.200', color: 'gray.700' }}
            rightIcon={<ChevronDownIcon />}
          >
            Copy
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleCopy('SLACK')}>Slack</MenuItem>
            <MenuItem onClick={() => handleCopy('MEET')}>Meet</MenuItem>
            <MenuItem onClick={() => handleCopy('MARKDOWN')}>Markdown</MenuItem>
            <MenuItem onClick={() => handleCopy('TXT')}>Plain Text</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Box>
  )
}
