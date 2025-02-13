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

export type Spacing = ('start' | 'end')[]

export const configSchema = z.object({
  groups: z.record(z.string().regex(new RegExp('^[a-z0-9_]*$')), z.instanceof(RegExp)),
  key: z.function().args(z.string()).returns(z.string()).optional(),
  output: z.string().regex(new RegExp('^[a-z0-9_]*$')).optional(),
})

export type Config = z.infer<typeof configSchema>
