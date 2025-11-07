import { describe, it, expect, vi, beforeEach } from 'vitest'
import ErrorAlert from './ErrorAlert'
import { toaster } from '@/components/ui/toaster'

// Mock toaster
vi.mock('@/components/ui/toaster', () => ({
  toaster: {
    create: vi.fn(),
  },
}))

describe('ErrorAlert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create error toast with provided title and description', () => {
    const title = 'Test Error'
    const description = 'Test error description'

    ErrorAlert({ title, description })

    expect(toaster.create).toHaveBeenCalledWith({
      title,
      description,
      type: 'error',
      duration: 5000,
    })
  })

  it('should use default title when not provided', () => {
    ErrorAlert({ description: 'Test description' })

    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'An error occurred',
      })
    )
  })

  it('should use default description when not provided', () => {
    ErrorAlert({ title: 'Test Title' })

    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'An error occurred while processing the log',
      })
    )
  })

  it('should use both defaults when neither provided', () => {
    ErrorAlert({})

    expect(toaster.create).toHaveBeenCalledWith({
      title: 'An error occurred',
      description: 'An error occurred while processing the log',
      type: 'error',
      duration: 5000,
    })
  })

  it('should always set type to error', () => {
    ErrorAlert({ title: 'Test' })

    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
      })
    )
  })

  it('should set duration to 5000ms', () => {
    ErrorAlert({ title: 'Test' })

    expect(toaster.create).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 5000,
      })
    )
  })
})
