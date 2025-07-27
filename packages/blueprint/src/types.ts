import { z } from 'zod'

export type Endpoint = {
  path: string
  method: string
  form: boolean
  name: {
    key: string
    type: string
  }
  controller: {
    relative: string
    path: string
  }
}

export const configSchema = z.object({
  groups: z
    .record(
      z
        .string()
        .regex(new RegExp('^[a-z0-9_]*$'))
        .describe('Group name, must contain only lowercase letters, numbers, and underscores.'),
      z.instanceof(RegExp).describe('Regular expression to match routes belonging to this group.')
    )
    .describe('Defines route groups and their matching patterns.'),
  key: z
    .function()
    .args(z.string())
    .returns(z.string())
    .optional()
    .describe('Optional function to transform route keys.'),
  output: z
    .string()
    .min(3)
    .max(20)
    .regex(new RegExp('^[a-z0-9_]*$'))
    .optional()
    .describe(
      'Optional output directory name, 3-20 characters, lowercase letters, numbers, and underscores only.'
    ),
  detached: z
    .boolean()
    .optional()
    .describe(
      'Generates types in a separate, detached file rather than inline. Useful for projects that prefer isolated type definitions.'
    ),
  typechecking: z
    .boolean()
    .optional()
    .describe(
      'Runs TypeScript type checking on generated files. Helps catch type errors before files are written.'
    ),
  linting: z
    .boolean()
    .optional()
    .describe(
      'Applies linting rules to generated files. Ensures code adheres to project linting standards.'
    ),
  formatting: z
    .boolean()
    .optional()
    .describe(
      "Enables automatic formatting of generated files using the project's formatter. Ensures code style consistency in output."
    ),
})

export type Config = z.infer<typeof configSchema>
