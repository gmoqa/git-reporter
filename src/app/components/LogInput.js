import { VStack, Textarea, Button } from '@chakra-ui/react';

export default function LogInput({ loading, onLogChange, onProcessClick }) {
  return (
    <VStack spacing={4} width="full">
      <Textarea
        placeholder="Paste your git log here"
        onChange={onLogChange}
        size="lg"
        height="200px"
        disabled={loading}
      />
      <Button
        colorScheme="blue"
        onClick={onProcessClick}
        isLoading={loading}
        loadingText="Processing"
        width="full"
      >
        Process
      </Button>
    </VStack>
  );
}
