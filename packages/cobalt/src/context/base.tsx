import { createSafeContext, MantineThemeOverride } from '@mantine/core'
import { Cobalt } from '../main.js'
import { NextRouter } from 'next/router.js'
import { Routes } from '@folie/blueprint-lib'
import { QueryClient } from '@tanstack/react-query'
import { CobaltConfig } from '../types/cobalt_config.js'

export type CobaltContextProps<ROUTES extends Routes> = {
  children: React.ReactNode
  cobalt?: Cobalt<ROUTES>
  mantine: MantineThemeOverride
  config: CobaltConfig
  router: NextRouter
  navigation?: {
    started: (url: string) => void
    completed: () => void
  }
}

export type CobaltProviderValues = {
  query?: QueryClient
}

export const [CobaltProvider, useCobaltContext] = createSafeContext<CobaltProviderValues>(
  'The component was not found in the tree under the "CobaltProvider"'
)
