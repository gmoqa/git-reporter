import { Box, HStack, IconButton, Spacer, Text } from '@chakra-ui/react'
import { FaEnvelope, FaGithub, FaTwitter } from 'react-icons/fa'
import Link from 'next/link'

export default function Footer() {
  return (
    <Box px={8} py={2} bgColor={'gray.900'}>
      <HStack>
        <Text color={'gray.500'}>
          GitReporter is licensed under the MIT License.
        </Text>
        <Spacer />
        <HStack mr={12}>
          <Link
            href='https://github.com/gmoqa/git-reporter'
            target={'_blank'}
          >
            <IconButton
              size={'lg'}
              aria-label='GitHub'
            >
              <FaGithub />
            </IconButton>
          </Link>
          <Link href='mailto:gu.quinteros@gmail.com' target={'_blank'}>
            <IconButton
              size={'lg'}
              aria-label='Email'
            >
              <FaEnvelope />
            </IconButton>
          </Link>
          <Link href='https://twitter.com/gitreporter' target={'_blank'}>
            <IconButton
              size={'lg'}
              aria-label='Twitter'
            >
              <FaTwitter />
            </IconButton>
          </Link>
        </HStack>
      </HStack>
    </Box>
  )
}
