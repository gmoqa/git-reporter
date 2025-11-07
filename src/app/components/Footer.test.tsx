import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Footer from './Footer'

describe('Footer', () => {
  it('should render MIT license text', () => {
    render(<Footer />)
    expect(
      screen.getByText(/GitReporter is licensed under the MIT License/i)
    ).toBeInTheDocument()
  })

  it('should render social media links', () => {
    render(<Footer />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)

    // Check GitHub link
    const githubLink = links.find((link) =>
      link.getAttribute('href')?.includes('github.com/gmoqa/git-reporter')
    )
    expect(githubLink).toBeInTheDocument()

    // Check Email link
    const emailLink = links.find((link) =>
      link.getAttribute('href')?.includes('mailto:')
    )
    expect(emailLink).toBeInTheDocument()

    // Check Twitter link
    const twitterLink = links.find((link) =>
      link.getAttribute('href')?.includes('twitter.com')
    )
    expect(twitterLink).toBeInTheDocument()
  })

  it('should render icon buttons', () => {
    render(<Footer />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })
})
