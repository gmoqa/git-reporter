import { VStack, Textarea, Button } from '@chakra-ui/react';

export default function LogInput({ loading, onLogChange, onProcessClick }) {
  return (
    <VStack spacing={4} width="full">
      <Textarea
        bgColor={'gray.200'}
        placeholder='Paste output here'
        onChange={onLogChange}
        size="lg"
        height="200px"
        disabled={loading}
        color={'gray.700'}
      />
      <Button
        colorScheme="yellow"
        onClick={onProcessClick}
        isLoading={loading}
        loadingText="Processing"
        width={'100%'}
        bgColor={'yellow.400'}
        color={'gray.700'}
        _hover={{ bgColor: 'yellow.200', color: 'gray.700' }}
      >
        Process
      </Button>
    </VStack>
  );
}
