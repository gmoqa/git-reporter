'use client'

import {
  Box,
  Button,
  HStack,
  Input,
  Spacer,
  Stack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { FaFilter, FaCalendar } from 'react-icons/fa'
import { formatDate } from '@/app/utils/date'
import { Radio, RadioGroup } from '@/components/ui/radio'
import type { ChangeEvent } from 'react'

type FilterType = 'WEEK' | '2_WEEKS' | 'MONTH' | 'CUSTOM' | null

interface ToolbarProps {
  setInitialDate: (date: string) => void
  setEndDate: (date: string) => void
  handleFilterResults: () => void
}

export default function Toolbar({
  setInitialDate,
  setEndDate,
  handleFilterResults,
}: ToolbarProps) {
  const [filter, setFilter] = useState<FilterType>(null)

  const updateFilter = (newFilter: FilterType) => {
    const today = new Date()
    let initialDay: number | undefined

    if (newFilter === 'WEEK') {
      initialDay = new Date(today).setDate(today.getDate() - 7)
    }

    if (newFilter === '2_WEEKS') {
      initialDay = new Date(today).setDate(today.getDate() - 14)
    }

    if (newFilter === 'MONTH') {
      initialDay = new Date(today).setMonth(today.getMonth() - 1)
    }

    if (initialDay) {
      handleInitialDateChange(new Date(initialDay))
    }
    handleEndDateChange(today)
    setFilter(newFilter)
  }

  const handleInitialDateChange = (value: Date | string) => {
    if (value) {
      setInitialDate(formatDate(value))
    }
  }

  const handleEndDateChange = (value: Date | string) => {
    if (value) {
      setEndDate(formatDate(value))
    }
  }

  return (
    <Box bgColor={'gray.600'} py={2} px={4} borderRadius={'lg'} mt={2}>
      <HStack>
        <FaCalendar color='gray.400' style={{ marginRight: '0.5rem' }} />
        <RadioGroup
          mt={1}
          onValueChange={(details) => updateFilter(details.value as FilterType)}
          value={filter ?? undefined}
          color={'gray.300'}
          fontWeight={'medium'}
          colorPalette={'yellow'}
        >
          <Stack direction='row'>
            <Radio value='WEEK'>Week</Radio>
            <Radio value='2_WEEKS'>2 Weeks</Radio>
            <Radio value='MONTH'>Month</Radio>
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInitialDateChange(e.target.value)
              }
              size='sm'
              type='date'
              color='gray.400'
            />
            <Input
              placeholder='End Date'
              name='end'
              borderRadius={'md'}
              borderColor={'gray.500'}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleEndDateChange(e.target.value)
              }
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
          onClick={() => handleFilterResults()}
        >
          <FaFilter />
          Filter
        </Button>
      </HStack>
    </Box>
  )
}
