import { QueryClientProvider } from '@tanstack/react-query'
import { useCobaltContext } from './base.js'

export const CobaltAPIContext = (props: { children: React.ReactNode }) => {
  const { query } = useCobaltContext()

  if (!query) {
    throw new Error('Query client not found, Have you passed "cobalt" in CobaltContext?')
  }

  return <QueryClientProvider client={query}>{props.children}</QueryClientProvider>
}
