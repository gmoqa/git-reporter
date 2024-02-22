import { createStandaloneToast } from '@chakra-ui/react'

export default function ErrorAlert({ title, description }) {
  const { toast } = createStandaloneToast()
  return toast({
    title: title || 'Ha ocurrido un error inesperado',
    description:
      description || 'Se ha reportado y estamos trabajando para que no ocurra',
    status: 'error',
    duration: 5000,
    width: '100vw',
  })
}
