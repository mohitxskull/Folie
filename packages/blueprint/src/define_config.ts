import { InvalidArgumentsException } from '@adonisjs/core/exceptions'
import { Config, configSchema } from './types.js'

/**
 * Defines the configuration options for the blueprint code generator using the defineConfig function.
 *
 * @param config The configuration object.
 * @property config.groups
 *   Defines route groups and their matching patterns.
 *   - Key: Group name (lowercase letters, numbers, underscores only).
 *   - Value: Regular expression to match routes belonging to this group.
 *
 * @property config.key
 *   Optional function to transform route keys.
 *
 * @property config.output
 *   Optional output directory name (3-20 characters, lowercase letters, numbers, underscores only).
 *
 * @property config.detached
 *   If true, generates types in a separate, detached file rather than inline.
 *   Useful for projects that prefer isolated type definitions.
 *
 * @property config.typechecking
 *   If true, runs TypeScript type checking on generated files to catch type errors before files are written.
 *
 * @property config.linting
 *   If true, applies linting rules to generated files to ensure code adheres to project linting standards.
 *
 * @property config.formatting
 *   If true, enables automatic formatting of generated files using the project's formatter for code style consistency.
 */
export const defineConfig = (config: Config) => {
  const parsedConfig = configSchema.safeParse(config)

  if (!parsedConfig.success) {
    throw new InvalidArgumentsException(parsedConfig.error.message, {
      cause: parsedConfig.error.format(),
    })
  }

  return parsedConfig.data
}
