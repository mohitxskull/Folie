import { z } from 'zod'
import { JSONFile } from './json_file.js'

const schema = z.object({
  compilerOptions: z.record(z.string(), z.any()).optional(),
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
})

export class TSConfig extends JSONFile<typeof schema> {
  constructor(path: string) {
    super('TSConfig', schema, path)
  }

  existCompilerOption(key: string): boolean {
    return this.data.compilerOptions?.[key] !== undefined
  }

  addCompilerOption(key: string, value: string | boolean): void {
    if (!this.data.compilerOptions) {
      this.data.compilerOptions = {}
    }

    this.data.compilerOptions = {
      ...this.data.compilerOptions,
      [key]: value,
    }
  }
}
