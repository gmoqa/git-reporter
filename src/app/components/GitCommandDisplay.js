import { Box, HStack, Text, Button } from '@chakra-ui/react';
import { FaCopy } from 'react-icons/fa';

export default function GitCommandDisplay({ COMMAND, onCopy, hasCopied }) {
  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} width="full" bgColor={'gray.900'}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontFamily="monospace" fontSize="sm">
          {COMMAND}
        </Text>
        <Button onClick={onCopy} size="sm" leftIcon={<FaCopy />}>
          {hasCopied ? 'Copied' : 'Copy'}
        </Button>
      </HStack>
    </Box>
  );
}
