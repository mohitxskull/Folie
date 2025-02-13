import { z } from 'zod'
import { JSONFile } from './json_file.js'

const schema = z.object({
  name: z
    .string()
    .regex(
      new RegExp('^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$')
    )
    .min(1)
    .max(214)
    .describe('The name of the package.'),
  version: z
    .string()
    .regex(new RegExp('^[0-9]+(.[0-9]+)*$'))
    .describe(
      'Version must be parseable by node-semver, which is bundled with npm as a dependency.'
    ),
  description: z
    .string()
    .describe("This helps people discover your package, as it's listed in 'npm search'.")
    .optional(),
  scripts: z
    .record(z.string().regex(new RegExp('^[^*]*(?:\\*[^*]*)?$')), z.string())
    .describe(
      "The 'scripts' member is an object hash of script commands that are run at various times in the lifecycle of your package. The key is the lifecycle event, and the value is the command to run at that point."
    ),
  dependencies: z.any().optional(),
  devDependencies: z.any().optional(),
  optionalDependencies: z.any().optional(),
  peerDependencies: z.any().optional(),
  packageManager: z
    .string()
    .regex(new RegExp('(npm|pnpm|yarn|bun)@\\d+\\.\\d+\\.\\d+(-.+)?'))
    .describe(
      'Defines which package manager is expected to be used when working on the current project. This field is currently experimental and needs to be opted-in; see https://nodejs.org/api/corepack.html'
    )
    .optional(),

  folie: z
    .object({
      pnpm: z
        .object({
          release: z.record(z.string(), z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
})

const removeKey = <T extends Record<string, any>>(obj: T, key: keyof T): Omit<T, keyof T> => {
  const { [key]: removed, ...rest } = obj
  return rest
}

export class PackageJSON extends JSONFile<typeof schema> {
  constructor(path: string) {
    super('PackageJSON', schema, path)
  }

  setDescription(description: string) {
    this.data = {
      ...this.data,
      description,
    }
  }

  existScript = (script: string) => {
    return this.data.scripts[script] !== undefined
  }

  removeScript = (script: string) => {
    if (!this.existScript(script)) {
      return
    }

    this.data = {
      ...this.data,
      scripts: removeKey(this.data.scripts, script),
    }
  }

  addScript = (script: string, command: string) => {
    this.data = {
      ...this.data,
      scripts: {
        ...this.data.scripts,
        [script]: command,
      },
    }
  }
}
