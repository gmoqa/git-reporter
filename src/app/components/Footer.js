import { Box, HStack, IconButton, Spacer, Text } from '@chakra-ui/react'
import { FaEnvelope, FaGithub, FaTwitter } from 'react-icons/fa'
import Link from 'next/link'

export default function Footer() {
  return (
    <Box px={8} py={2} bgColor={'gray.900'}>
      <HStack>
        <Text color={'gray.500'}>
          GitReporter is licensed under the MIT License.
        <Spacer />
        <HStack mr={12}>
          <Link href='https://github.com/gmoqa/git-reporter' isExternal target={'_blank'}>
            <IconButton size={'lg'} icon={<FaGithub />} colorScheme={'dark'} color={'gray.300'} />
          </Link>
          <Link href='mailto:gu.quinteros@gmail.com' isExternal target={'_blank'}>
            <IconButton size={'lg'} icon={<FaEnvelope />} colorScheme={'dark'} color={'gray.300'} />
          </Link>
          <Link href='https://twitter.com/gitreporter' isExternal target={'_blank'}>
            <IconButton size={'lg'} icon={<FaTwitter />} colorScheme={'dark'} color={'gray.300'} />
          </Link>
        </HStack>
      </HStack>
    </Box>
  )
}
