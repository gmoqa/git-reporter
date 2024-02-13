import { Box, HStack, IconButton, Spacer, Text } from '@chakra-ui/react'
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'

export default function Footer() {
  return (
    <Box px={8} py={10} bgColor={'gray.900'}>
      <HStack>
        <Text color={'gray.300'} fontWeight={'medium'}>
          git reporter © 2024{' '}
        </Text>
        <Spacer />
        <HStack>
          <IconButton variant={'ghost'} icon={<FaGithub />} />
          <IconButton variant={'ghost'} icon={<FaLinkedin />} />
          <IconButton variant={'ghost'} icon={<FaTwitter />} />
        </HStack>
      </HStack>
      <HStack mt={10}>
        <Text color={'gray.500'} fontWeight={'medium'}>
          by fenec #devs , All rigths reserved
        </Text>
      </HStack>
    </Box>
  )
}
