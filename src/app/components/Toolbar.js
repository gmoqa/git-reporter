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
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useState } from 'react'

export default function Toolbar({ setInitialDate, setEndDate, onFilter }) {
  const [filter, setFilter] = useState('WEEK')

  const updateFilter = (e) => {
    const value = e.target.value
    setFilter(value)
  }

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
    <Box bgColor={'gray.800'} py={2} px={4} borderRadius={'lg'} mt={2}>
      <HStack>
        <RadioGroup
          onChange={updateFilter}
          value={filter}
          color={'gray.500'}
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
              onChange={handleInitialDateChange}
              size='sm'
              type='date'
              color='gray.400'
            />
            <Input
              placeholder='End Date'
              name='end'
              borderRadius={'md'}
              borderColor={'gray.500'}
              onChange={handleEndDateChange}
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
          leftIcon={<SearchIcon />}
          onClick={onFilter}
        >
          Filter
        </Button>
      </HStack>
    </Box>
  )
}
