import { ColorSchemeScript } from '@mantine/core'
import { CobaltConfig } from '../types/index.js'

export const HeadScript = (params: CobaltConfig) => (
  <ColorSchemeScript
    defaultColorScheme={params.theme}
    {...(params.forceTheme && {
      forceColorScheme: params.theme === 'dark' ? 'dark' : 'light',
    })}
  />
)
