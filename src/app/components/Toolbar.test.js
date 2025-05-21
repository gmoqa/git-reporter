import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toolbar from './Toolbar';
import * as markdownGenerator from '@/app/utils/markdownGenerator'; // Import as module
import { ChakraProvider } from '@chakra-ui/react'; // Import ChakraProvider

// Mock an implementation of useToast
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'), // Import and retain default exports
  useToast: () => mockToast, // Mock useToast
}));

// Mock navigator.clipboard.writeText
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  },
  writable: true,
});

// Mock formatMarkdown
jest.mock('@/app/utils/markdownGenerator', () => ({
  formatMarkdown: jest.fn(),
}));

const mockMarkdownSource = "## Test Markdown\n- Item 1\n- [Link](http://example.com)";

const renderToolbar = (props = {}) => {
  return render(
    <ChakraProvider> {/* Wrap Toolbar with ChakraProvider */}
      <Toolbar
        setInitialDate={jest.fn()}
        setEndDate={jest.fn()}
        handleFilterResults={jest.fn()}
        markdownSource={mockMarkdownSource}
        {...props}
      />
    </ChakraProvider>
  );
};

describe('Toolbar Component', () => {
  beforeEach(() => {
    // Clear mock history before each test
    mockToast.mockClear();
    navigator.clipboard.writeText.mockClear();
    markdownGenerator.formatMarkdown.mockClear();
  });

  test('renders Filter button and Copy button', () => {
    renderToolbar();
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  test('Copy button dropdown opens and shows menu items', async () => {
    renderToolbar();
    const copyButton = screen.getByRole('button', { name: /copy/i });
    await userEvent.click(copyButton);

    expect(await screen.findByText('Slack')).toBeVisible();
    expect(screen.getByText('Meet')).toBeVisible();
    expect(screen.getByText('Markdown')).toBeVisible();
    expect(screen.getByText('Plain Text')).toBeVisible();
  });

  const testCases = [
    { format: 'SLACK', label: 'Slack' },
    { format: 'MEET', label: 'Meet' },
    { format: 'MARKDOWN', label: 'Markdown' },
    { format: 'TXT', label: 'Plain Text' },
  ];

  testCases.forEach(({ format, label }) => {
    describe(`Copy to ${label}`, () => {
      const formattedOutput = `Formatted for ${format}`;

      beforeEach(() => {
        markdownGenerator.formatMarkdown.mockReturnValue(formattedOutput);
      });

      test(`copies ${label} formatted text and shows success toast`, async () => {
        renderToolbar();
        const copyButton = screen.getByRole('button', { name: /copy/i });
        await userEvent.click(copyButton);
        const menuItem = await screen.findByText(label);
        await userEvent.click(menuItem);

        expect(markdownGenerator.formatMarkdown).toHaveBeenCalledWith(mockMarkdownSource, format);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(formattedOutput);
        await waitFor(() => {
          expect(mockToast).toHaveBeenCalledWith({
            title: 'Copied to clipboard!',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        });
      });

      test(`shows error toast if copying ${label} formatted text fails`, async () => {
        navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Copy failed'));
        renderToolbar();
        const copyButton = screen.getByRole('button', { name: /copy/i });
        await userEvent.click(copyButton);
        const menuItem = await screen.findByText(label);
        await userEvent.click(menuItem);

        expect(markdownGenerator.formatMarkdown).toHaveBeenCalledWith(mockMarkdownSource, format);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(formattedOutput);
        await waitFor(() => {
          expect(mockToast).toHaveBeenCalledWith({
            title: 'Failed to copy',
            description: 'Could not copy text to clipboard.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        });
      });
    });
  });
});
