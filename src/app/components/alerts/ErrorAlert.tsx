import { toaster } from '@/components/ui/toaster'

interface ErrorAlertProps {
  title?: string
  description?: string
}

export default function ErrorAlert({ title, description }: ErrorAlertProps) {
  return toaster.create({
    title: title || 'An error occurred',
    description: description || 'An error occurred while processing the log',
    type: 'error',
    duration: 5000,
  })
}
