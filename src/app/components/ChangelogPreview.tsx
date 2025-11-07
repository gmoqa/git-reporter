import { Box } from '@chakra-ui/react'
import MarkdownPreview from '@uiw/react-markdown-preview'
import type { Element } from 'hast'

interface ChangelogPreviewProps {
  source: string
}

export default function ChangelogPreview({ source }: ChangelogPreviewProps) {
  return (
    <Box
      borderWidth='1px'
      borderRadius='lg'
      p={4}
      width='full'
      mt={8}
      bgColor={'white'}
      data-color-mode='light'
    >
      <MarkdownPreview
        source={source}
        rehypeRewrite={(node, index, parent) => {
          const element = node as Element
          const parentElement = parent as Element | null

          if (
            element.tagName === 'a' &&
            parentElement &&
            /^h(1|2|3|4|5|6)/.test(parentElement.tagName)
          ) {
            parentElement.children = parentElement.children.slice(1)
          }
        }}
      />
    </Box>
  )
}
