import { InvalidArgumentsException } from '@adonisjs/core/exceptions'
import { Config, configSchema } from './types.js'

export const defineConfig = (config: Config) => {
  const parsedConfig = configSchema.safeParse(config)

  if (!parsedConfig.success) {
    throw new InvalidArgumentsException(parsedConfig.error.message, {
      cause: parsedConfig.error.format(),
    })
  }

  return parsedConfig.data
}
