import { Box } from '@chakra-ui/react';
import MarkdownPreview from '@uiw/react-markdown-preview';

export default function ChangelogPreview({ source }) {
  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} width="full" mt={8} bgColor={'white'}  data-color-mode='light'>
      <MarkdownPreview
        source={source}
        rehypeRewrite={(node, index, parent) => {
          if (node.tagName === "a" && parent && /^h(1|2|3|4|5|6)/.test(parent.tagName)) {
            parent.children = parent.children.slice(1)
          }
        }}
      />
    </Box>
  );
}
