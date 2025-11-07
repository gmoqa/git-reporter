import { VStack, Textarea, Button } from '@chakra-ui/react'
import type { ChangeEvent } from 'react'

interface LogInputProps {
  loading: boolean
  onLogChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onProcessClick: () => void
}

export default function LogInput({
  loading,
  onLogChange,
  onProcessClick,
}: LogInputProps) {
  return (
    <VStack gap={4} width='full'>
      <Textarea
        bgColor={'gray.200'}
        placeholder='Paste output here'
        onChange={onLogChange}
        size='lg'
        height='200px'
        disabled={loading}
        color={'gray.700'}
      />
      <Button
        colorScheme='yellow'
        onClick={onProcessClick}
        loading={loading}
        loadingText='Processing'
        width={'100%'}
        bgColor={'yellow.400'}
        color={'gray.700'}
        _hover={{ bgColor: 'yellow.200', color: 'gray.700' }}
      >
        Process
      </Button>
    </VStack>
  )
}
