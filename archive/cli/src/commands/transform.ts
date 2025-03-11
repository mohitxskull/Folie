import { args, flags } from '@adonisjs/ace'
import JSObfuscator from 'javascript-obfuscator'
import { directoryPaths, isDirectory, pathExists, readFileOptional } from '../lib/fs.js'
import { minify } from 'terser'
import { BaseCommand } from '../command.js'
import { writeFile } from 'node:fs/promises'
import { space } from '../lib/space.js'

export class Transform extends BaseCommand {
  static commandName: string = 'transform'
  static description: string = 'Transform javascript files'

  @args.string({ description: 'The path to the file or folder', required: true })
  declare path: string

  @flags.boolean({
    description: 'Obfuscate the file(s) using JSObfuscator',
  })
  declare obfuscate: boolean

  @flags.boolean({
    description: 'Minify the file(s) using Terser',
  })
  declare minify: boolean

  @flags.boolean({
    description:
      'Use when minifying an ES6 module. "use strict" is implied and names can be mangled on the top scope.',
    default: true,
  })
  declare module: boolean

  async run() {
    if (!this.obfuscate && !this.minify) {
      this.logger.error('You must specify either --obfuscate or --minify')
      return
    }

    const files: string[] = []

    const ifDir = await isDirectory(this.path)

    const scanning = this.cli.action(`Scanning ${ifDir ? 'directory' : 'file'}: ${this.path}`)

    scanning.started()

    if (ifDir) {
      if (!pathExists(this.path)) {
        scanning.failed(`Folder ${this.path} does not exist`)
        return
      }

      const filesInFolder = await directoryPaths(this.path, (file) => file.endsWith('.js'))

      files.push(...filesInFolder)
    } else {
      if (!pathExists(this.path)) {
        scanning.failed(`File ${this.path} does not exist`)
        return
      }

      if (!this.path.endsWith('.js')) {
        scanning.failed(`File ${this.path} is not a javascript file`)
        return
      }

      files.push(this.path)
    }

    if (files.length === 0) {
      scanning.failed(`No files found in ${this.path}`)
      return
    }

    scanning.completed()

    if (this.obfuscate) {
      const obfuscating = this.cli.action(`Obfuscating ${files.length} files`)

      obfuscating.started()

      try {
        for (const file of files) {
          const obfuscatingFile = this.cli.action(`Obfuscating ${file}`)

          obfuscatingFile.started()

          const content = await readFileOptional(file)

          if (!content) {
            obfuscating.failed(`Failed to read ${file}`)
            return
          }

          const obfuscated = JSObfuscator.obfuscate(content)

          await writeFile(file, obfuscated.getObfuscatedCode())

          obfuscatingFile.completed()
        }

        space()

        obfuscating.completed()
      } catch (error) {
        space()

        obfuscating.failed(error)
      }
    }

    if (this.minify) {
      const minifying = this.cli.action(`Minifying ${files.length} files`)

      minifying.started()

      try {
        for (const file of files) {
          const minifyingFile = this.cli.action(`Minifying ${file}`)

          minifyingFile.started()

          const content = await readFileOptional(file)

          if (!content) {
            minifyingFile.failed(`Failed to read ${file}`)
            continue
          }

          const minified = await minify(content, {
            compress: true,
            module: this.module,
          })

          if (!minified.code) {
            minifyingFile.failed(`Failed to minify ${file}`)
            continue
          }

          await writeFile(file, minified.code)

          minifyingFile.completed()
        }

        space()

        minifying.completed()
      } catch (error) {
        space()

        minifying.failed(error)
      }
    }
  }
}
