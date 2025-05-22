'use client'

import {
  Box,
  Button,
  HStack,
  Input,
  // Radio, // Radio is now part of RadioGroup
  RadioGroup,
  Spacer,
  Stack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { FaCalendarAlt, FaFilter } from 'react-icons/fa'
import { formatDate } from '@/app/utils/date'

export default function Toolbar({
  setInitialDate,
  setEndDate,
  handleFilterResults,
}) {
  const [filter, setFilter] = useState(null)

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
        <FaCalendarAlt color={'gray.400'} style={{ marginRight: '0.5rem' }} />
        <RadioGroup.Root
          mt={1}
          onValueChange={(details) => updateFilter(details.value)}
          value={filter}
          colorPalette={'yellow'}
        >
          <Stack direction='row' color={'gray.300'} fontWeight={'medium'}>
            <RadioGroup.Item value='WEEK'>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>Week</RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item value='2_WEEKS'>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>2 Weeks</RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item value='MONTH'>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>Month </RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item value='CUSTOM'>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>Custom</RadioGroup.ItemText>
            </RadioGroup.Item>
          </Stack>
        </RadioGroup.Root>
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
      </HStack>
    </Box>
  )
}
