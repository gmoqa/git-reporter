import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from '@/components/ui/provider'

// Custom render function that includes Chakra Provider
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <Provider>{children}</Provider>,
    ...options,
  })
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { customRender as render }
