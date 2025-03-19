import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Project, QuoteKind } from 'ts-morph'
import { fileURLToPath } from 'node:url'
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { RouteJSON } from '@adonisjs/core/types/http'
import { parseBindingReference, slash } from '@adonisjs/core/helpers'
import stringHelpers from '@adonisjs/core/helpers/string'
import { dirname, relative } from 'node:path'
import { x } from 'tinyexec'
import { RuntimeException } from '@adonisjs/core/exceptions'
import { Config, Endpoint } from '../src/types.js'
import { Action } from '../src/action_logger.js'

export default class BluePrintGenerate extends BaseCommand {
  static commandName = 'blueprint:generate'
  static description = 'Generate API blueprint from routes'

  @flags.boolean({
    default: true,
  })
  declare formatting: boolean

  @flags.boolean({
    default: true,
  })
  declare typechecking: boolean

  @flags.boolean({
    default: true,
  })
  declare linting: boolean

  static options: CommandOptions = {
    startApp: true,
  }

  #config = () => {
    const rawConfig = this.app.config.get<Config | null>('blueprint', null)

    if (!rawConfig) {
      throw new RuntimeException(
        'Invalid "config/blueprint.ts" file. Make sure you are using the "defineConfig" method'
      )
    }

    return rawConfig
  }

  #getRootPath = (path: string) => fileURLToPath(new URL(path, this.app.appRoot))

  #getClientPath = (path?: string) =>
    this.#getRootPath(`./${this.#config().output ?? 'blueprint'}/${path || ''}`)

  #getSchemaPath = (group?: string) => this.#getClientPath(`${group || ''}/schema.ts`)

  #getReferencePath = () => this.#getClientPath('reference.ts')

  #getRelativePath = (from: string, to: string) => slash(relative(from, to))

  #prepareDestination() {
    const directory = this.#getClientPath()

    if (existsSync(directory)) {
      const files = readdirSync(directory)

      for (const file of files) {
        if (!file.endsWith('.ts')) {
          rmSync(file, { recursive: true, force: true })
        }
      }
    } else {
      mkdirSync(directory, { recursive: true })
    }
  }

  #getMethod(methods: string[]) {
    let result = 'GET'

    for (const method of methods) {
      const lowerMethod = method.toLowerCase()

      if (lowerMethod === 'head') {
        continue
      }

      result = lowerMethod.toUpperCase()
    }

    return result
  }

  #getConstructorAction(path: string) {
    const fileName = path.split('/').pop()

    if (!fileName) {
      throw new Error('Unable to determine the file name', {
        cause: {
          path,
        },
      })
    }

    if (!fileName.endsWith('_controller.ts')) {
      throw new Error('The file name must end with "_controller.ts"', {
        cause: {
          path,
        },
      })
    }

    return fileName.replace('_controller.ts', '').split('_')
  }

  async #groupRoutes(routes: RouteJSON[]) {
    const config = this.#config()

    const result = new Map<string, RouteJSON[]>()

    for (const route of routes) {
      let group: string | undefined

      for (const [key, value] of Object.entries(config.groups)) {
        if (value.test(route.pattern)) {
          group = key
          break
        }
      }

      if (!group) {
        group = 'default'
      }

      if (!result.has(group)) {
        result.set(group, [])
      }

      result.get(group)!.push(route)
    }

    return result
  }

  async #getRoutes() {
    const router = await this.app.container.make('router')

    router.commit()

    return router.toJSON().root
  }

  #action(title: string) {
    return new Action(title)
      .useColors(this.kernel.ui.logger.getColors())
      .useRenderer(this.kernel.ui.logger.getRenderer())
  }

  async #runCMD(params: {
    message: string
    command: {
      main: string
      args?: string[]
    }
    active?: boolean
    verbose?: boolean
  }) {
    if (params.active === false) {
      return
    }

    const runningCommand = this.#action(params.message)

    runningCommand.started()

    const res = await x(params.command.main, params.command.args, {
      nodeOptions: {
        stdio: params.verbose ? 'inherit' : undefined,
      },
    })

    if (res.exitCode !== 0) {
      for (const line of res.stdout.split('\n')) {
        const parsedLine = line.trim()

        if (parsedLine.length > 0) {
          runningCommand.error(parsedLine)
        }
      }

      for (const line of res.stderr.split('\n')) {
        const parsedLine = line.trim()

        if (parsedLine.length > 0) {
          runningCommand.error(parsedLine)
        }
      }

      process.exit(1)
    }

    runningCommand.completed()
  }

  async #writeSchemaFile(group: string, endpoints: Endpoint[]) {
    const file = this.#project.createSourceFile(this.#getSchemaPath(group), '', { overwrite: true })

    if (!file) throw new Error('Unable to create the schema.ts file')

    const referenceFilePath = this.#getRelativePath(
      this.#getClientPath(group),
      this.#getClientPath('reference.ts')
    )

    file.removeText().insertText(0, (writer) => {
      writer.writeLine(`/// <reference path="${referenceFilePath}" />`)

      writer.newLine()

      writer.writeLine(`import { InferController, endpoint } from '@folie/blueprint-lib'`)

      writer.newLine()

      writer.writeLine(`/*`)
      writer.writeLine(` * This is an auto-generated file. Changes made to this file will be lost.`)
      writer.writeLine(' * Run `nr ace blueprint:generate` to update it.')
      writer.writeLine(` */`)

      writer.newLine()

      endpoints.forEach((route) => {
        writer.writeLine(
          `export type ${route.name.type} = InferController<(typeof import('${route.controller.relative}'))['default']>`
        )
      })

      writer.newLine()

      writer
        .write('export const endpoints = ')
        .inlineBlock(() => {
          endpoints.forEach((route) => {
            writer.writeLine(
              `${route.name.key}: endpoint<${route.name.type}>({ form: ${route.form}, url: '${route.path}', method: '${route.method}' }),`
            )
          })
        })
        .write(' as const')
    })

    await file.save()
  }

  async #writeReferenceFile() {
    const path = this.#getReferencePath()

    if (existsSync(path)) {
      return
    }

    const file = this.#project.createSourceFile(path, '', { overwrite: true })

    const rcFilePath = this.#getRelativePath(dirname(path), this.#getRootPath('adonisrc.ts'))

    file.removeText().insertText(0, (writer) => {
      writer.writeLine(`/// <reference path="${rcFilePath}" />`)

      writer.newLine()

      writer.writeLine(`/* Add the other required types here */`)
    })

    await file.save()
  }

  #project = new Project({
    manipulationSettings: { quoteKind: QuoteKind.Single, useTrailingCommas: true },
    tsConfigFilePath: this.#getRootPath('tsconfig.json'),
  })

  async run() {
    const config = this.#config()

    await this.#runCMD({
      message: 'Formatting files',
      command: {
        main: 'prettier',
        args: ['--write', '.'],
      },
      active: this.formatting,
    })

    await this.#runCMD({
      message: 'Typechecking',
      command: {
        main: 'tsc',
        args: ['--noEmit'],
      },
      active: this.typechecking,
    })

    await this.#runCMD({
      message: 'Linting',
      command: {
        main: 'eslint',
        args: ['.'],
      },
      active: this.linting,
    })

    const generatingBlueprint = this.#action('Generating blueprint')

    generatingBlueprint.started()

    this.#prepareDestination()

    generatingBlueprint.progress('Destination prepared')

    const routes = await this.#groupRoutes(await this.#getRoutes())

    generatingBlueprint.progress('Routes grouped')

    await this.#writeReferenceFile()

    generatingBlueprint.progress('Reference file written')

    const parsingRoutes = this.#action('Parsing routes')

    parsingRoutes.started()

    const sourcesFiles = this.#project.getSourceFiles()

    const endpoints: Endpoint[] = []

    for (const [group, groupRoutes] of routes.entries()) {
      const groupEndpoints: Endpoint[] = []

      const processingGroup = this.#action(`Processing group "${group}"`)

      processingGroup.started()

      for (const route of groupRoutes) {
        const processingRoute = this.#action(
          `Processing route "${route.pattern}" in group "${group}"`
        )

        processingRoute.started()

        // =======================

        if (typeof route.handler === 'function') {
          processingRoute.skipped(`We don't support function routes`)
          continue
        }

        const routeHandler = await parseBindingReference(route.handler.reference)

        const routeSourceFile = sourcesFiles.find((sf) =>
          sf.getFilePath().endsWith(`${routeHandler.moduleNameOrPath.replace('#', '')}.ts`)
        )

        if (!routeSourceFile) {
          processingRoute.failed(`We couldn't find the source file`)
          continue
        }

        const relativePath = this.#getRelativePath(
          this.#getClientPath(group),
          routeSourceFile.getFilePath()
        )

        // Key Generation

        const spacedPath: string[] = []

        for (const segment of route.pattern.split(/[./-]+/)) {
          if (!segment.startsWith(':')) {
            spacedPath.push(segment)
          }
        }

        spacedPath.push(...this.#getConstructorAction(relativePath))

        const joinedSpacedPath = [
          ...new Set(spacedPath.map((s) => stringHelpers.snakeCase(s))),
        ].join(' ')

        const parsedSpacedPath = config.key ? config.key(joinedSpacedPath) : joinedSpacedPath

        // ======================

        const splittedPath = route.pattern
          .split('/')
          .slice(1)
          .map((segment, segmentIndex) => {
            if (segment.startsWith(':')) {
              const paramName = segment.slice(1)
              if (!/^[a-zA-Z?]+$/.test(paramName)) {
                throw new Error('Only letters allowed in parameter segments', {
                  cause: { segment: segmentIndex, route: route.pattern },
                })
              }
              return `{{ ${paramName.replace('?', '')} }}`
            } else if (!/^[a-z0-9-]+$/i.test(segment)) {
              throw new Error(
                'Only lowercase letters, numbers, and hyphens allowed in non-parameter segments',
                {
                  cause: { segment: segmentIndex, route: route.pattern },
                }
              )
            }
            return segment
          })

        const endpointDraft: Endpoint = {
          path: `/${splittedPath.join('/')}`,
          method: this.#getMethod(route.methods),
          form: false,
          controller: {
            relative: relativePath,
            path: routeHandler.moduleNameOrPath,
          },
          name: {
            key: stringHelpers.snakeCase(parsedSpacedPath).toUpperCase(),
            type: `${stringHelpers.pascalCase(parsedSpacedPath)}Route`,
          },
        }

        processingRoute.progress('Successfully parsed the route')

        // =======================

        for (const parsedRoute of endpoints) {
          if (parsedRoute.controller.path === endpointDraft.controller.path) {
            throw new Error(
              `The controller ${endpointDraft.controller.path} is already registered`,
              {
                cause: {
                  currentRoute: endpointDraft,
                  registeredRoute: parsedRoute,
                },
              }
            )
          }

          if (parsedRoute.name.key === endpointDraft.name.key) {
            throw new Error(`The controller key has already been registered`, {
              cause: {
                currentRoute: endpointDraft,
                registeredRoute: parsedRoute,
              },
            })
          }
        }

        const classDef = routeSourceFile.getClasses().find((c) => c.isDefaultExport())

        if (!classDef) {
          throw new Error(`We were not able to find the default export`, {
            cause: {
              endpoint: endpointDraft,
            },
          })
        }

        if (!classDef.getType().isClass()) {
          throw new Error(`The default export is not a class`, {
            cause: {
              endpoint: endpointDraft,
            },
          })
        }

        const handleMethod = classDef.getProperty('handle')
        const inputProperty = classDef.getProperty('input')
        const formProperty = classDef.getProperty('form')

        if (!handleMethod) {
          throw new Error(`We were not able to find the "handle" method`, {
            cause: {
              endpoint: endpointDraft,
            },
          })
        }

        if (inputProperty) {
          const inputPropertyType = inputProperty.getType()

          if (!inputPropertyType.isObject()) {
            throw new Error(`The "input" property is not an object`, {
              cause: {
                endpoint: endpointDraft,
              },
            })
          }
        }

        if (formProperty) {
          const formPropertyType = formProperty.getType()

          if (!formPropertyType.isBoolean()) {
            throw new Error(`The "form" property is not a boolean`, {
              cause: {
                endpoint: endpointDraft,
              },
            })
          }

          endpointDraft.form = Boolean(formProperty.getStructure().initializer)
        }

        groupEndpoints.push(endpointDraft)
        endpoints.push(endpointDraft)

        // =======================

        processingRoute.completed()
      }

      if (groupEndpoints.length === 0) {
        processingGroup.skipped(`No routes found in "${group}" group`)
        continue
      }

      await this.#writeSchemaFile(group, groupEndpoints)

      processingGroup.completed()
    }

    parsingRoutes.completed()

    // =======================

    await this.#runCMD({
      message: 'Formatting client file',
      command: {
        main: 'prettier',
        args: ['--write', this.#getClientPath()],
      },
      active: this.formatting,
    })

    generatingBlueprint.completed()
  }
}
