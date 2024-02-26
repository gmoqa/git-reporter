'use client'

import { Button, HStack, Input } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'

export default function Toolbar({ setInitialDate, setEndDate, onFilter }) {
  const handleInitialDateChange = (e) => {
    const value = e.target.value
    if (value) {
      const initialDate = new Date(value).toISOString().split('T')[0]
      setInitialDate(initialDate)
    }
  }

  const handleEndDateChange = (e) => {
    const value = e.target.value
    if (value) {
      const endDate = new Date(value).toISOString().split('T')[0]
      setEndDate(endDate)
    }
  }

  return (
    <HStack bgColor={'gray.900'}>
      <HStack>
        <Input
          placeholder='Start Date'
          name='initial'
          onChange={handleInitialDateChange}
          size='md'
          type='date'
          color='gray.400'
        />
        <Input
          placeholder='End Date'
          name='end'
          onChange={handleEndDateChange}
          size='md'
          type='date'
          color='gray.400'
        />
      </HStack>
      <HStack>
        <Button
          size={'md'}
          borderRadius={'md'}
          _hover={{ bgColor: 'gray.700' }}
          color={'gray.300'}
          bgColor={'gray.800'}
          leftIcon={<SearchIcon />}
          onClick={onFilter}
        >
          Filter
        </Button>
      </HStack>
    </HStack>
  )
}
