import { createStandaloneToast } from '@chakra-ui/react'

export default function SuccessAlert({ title, description }) {
  const { toast } = createStandaloneToast()
  return toast({
    title: title,
    description: description,
    status: 'success',
    duration: 5000,
  })
}
