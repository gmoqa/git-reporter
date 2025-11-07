import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import GitCommandDisplay from './GitCommandDisplay'

describe('GitCommandDisplay', () => {
  const mockCommand = 'git log --all'
  const mockOnCopy = vi.fn()

  it('should render git command', () => {
    render(
      <GitCommandDisplay
        COMMAND={mockCommand}
        onCopy={mockOnCopy}
        hasCopied={false}
      />
    )

    expect(screen.getByText(mockCommand)).toBeInTheDocument()
  })

  it('should show "Copy" button when not copied', () => {
    render(
      <GitCommandDisplay
        COMMAND={mockCommand}
        onCopy={mockOnCopy}
        hasCopied={false}
      />
    )

    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('should show "Copied" button when copied', () => {
    render(
      <GitCommandDisplay
        COMMAND={mockCommand}
        onCopy={mockOnCopy}
        hasCopied={true}
      />
    )

    expect(screen.getByText('Copied')).toBeInTheDocument()
  })

  it('should call onCopy when button clicked', async () => {
    const user = userEvent.setup()
    render(
      <GitCommandDisplay
        COMMAND={mockCommand}
        onCopy={mockOnCopy}
        hasCopied={false}
      />
    )

    const button = screen.getByRole('button', { name: /copy/i })
    await user.click(button)

    expect(mockOnCopy).toHaveBeenCalledOnce()
  })
})
