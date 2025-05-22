import { createStandaloneToast } from '@chakra-ui/toast'

export default function ErrorAlert({ title, description }) {
  const { toast } = createStandaloneToast()
  return toast({
    title: title || 'An error occurred',
    description:
      description || 'An error occurred while processing the log',
    status: 'error',
    duration: 5000,
    width: '100vw',
  })
}
