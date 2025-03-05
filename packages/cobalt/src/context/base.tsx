import { createSafeContext, MantineThemeOverride } from '@mantine/core'
import { NextRouter } from 'next/router.js'
import { CobaltConfig } from '../types/cobalt_config.js'

export type CobaltContextProps = {
  children: React.ReactNode
  mantine: MantineThemeOverride
  config: CobaltConfig
  router: NextRouter
  navigation?: {
    started: (url: string) => void
    completed: () => void
  }
}

export type CobaltProviderValues = {}

export const [CobaltProvider, useCobaltContext] = createSafeContext<CobaltProviderValues>(
  'The component was not found in the tree under the "CobaltProvider"'
)
