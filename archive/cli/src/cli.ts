import { ListLoader } from '@adonisjs/ace'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BaseCommand, HelpCommand } from './command.js'
import { Kernel } from './kernel.js'
import { installPackage, PackageManager } from '@antfu/install-pkg'
import { x } from 'tinyexec'
import { pathExists, readFileOptional, writeFileToPath } from './lib/fs.js'
import { compile } from 'tempura'
import { Action } from './lib/action_logger.js'
import { NPM } from './lib/npm.js'
import { compare } from 'compare-versions'
import { CLIConfig } from '../config.js'
import { PackageJSON } from './lib/json/package_json.js'
import { space } from './lib/space.js'
import { Spinner } from './lib/spinner_logger.js'

export class CLI<STUBS extends typeof CLIConfig.STUBS> {
  #npm = new NPM()

  #appRoot: URL

  #kernel = new Kernel(this)

  #stubs: STUBS

  #packageJSON: PackageJSON

  get appRoot() {
    return this.#appRoot
  }

  get kernel() {
    return this.#kernel
  }

  action(title: string) {
    return new Action(title)
      .useColors(this.#kernel.ui.logger.getColors())
      .useRenderer(this.#kernel.ui.logger.getRenderer())
  }

  spinner(title: string) {
    return new Spinner({
      text: title,
      render() {
        return title
      },
    }).useRenderer(this.#kernel.ui.logger.getRenderer())
  }

  constructor(params: { appRoot: URL; commands: (typeof BaseCommand)[]; stubs: STUBS }) {
    this.#appRoot = params.appRoot
    this.#stubs = params.stubs

    let packageJSONPath = this.makePath('./package.json')

    if (!pathExists(packageJSONPath)) {
      packageJSONPath = this.makePath('../package.json')

      if (!pathExists(packageJSONPath)) {
        throw new Error('Package.json not found')
      }
    }

    this.#packageJSON = new PackageJSON(packageJSONPath)

    this.#kernel.addLoader(new ListLoader([HelpCommand, ...params.commands]))

    this.#kernel.defineFlag('help', {
      type: 'boolean',
      alias: 'h',
      description:
        'Display help for the given command. When no command is given display help for the list command',
    })

    this.#kernel.defineFlag('env', {
      type: 'string',
      description: 'The environment the command should run under',
    })

    this.#kernel.defineFlag('ansi', {
      type: 'boolean',
      showNegatedVariantInHelp: true,
      description: 'Enable/disable colorful output',
    })

    this.#kernel.on('ansi', (_, $kernel, options) => {
      if (options.flags.ansi === false) {
        $kernel.ui.switchMode('silent')
      }

      if (options.flags.ansi === true) {
        $kernel.ui.switchMode('normal')
      }
    })

    this.#kernel.on('help', async (command, $kernel, options) => {
      options.args.unshift(command.commandName)

      await new HelpCommand(this, $kernel, options, this.kernel.ui, this.kernel.prompt).exec()

      return true
    })
  }

  run = async (args: string[]) => {
    space()

    const spinner = this.spinner('Starting Folie CLI')

    spinner.start()

    await this.#packageJSON.sync()

    const packageJSON = this.#packageJSON.data
    const sticker = this.#kernel.ui.sticker().fullScreen()
    const colors = sticker.getColors()

    const isReachable = await this.#npm.reachable()

    let isLatest = false

    if (isReachable) {
      const onlineVersion = await this.#npm.version(packageJSON.name)

      if (!onlineVersion.success) {
        throw new Error(onlineVersion.reason)
      }

      const localVersion = packageJSON.version

      isLatest = compare(localVersion, onlineVersion.data, '>=')
    }

    sticker.heading(
      `${packageJSON.name} ${isLatest ? colors.green(`v${packageJSON.version}`) : colors.red(`v${packageJSON.version}`)}`
    )

    sticker
      .add('Folie CLI provides a set of commands for interacting with the Folie suite of packages.')
      .add('')

    if (isReachable) {
      if (isLatest) {
        sticker.add(colors.green('You are running the latest version.'))
      } else {
        sticker
          .add(colors.yellow('You are not running the latest version.'))
          .add(`Run ${colors.green(`npm i ${this.#packageJSON.data.name} -g`)} to update.`)
      }
    } else {
      sticker.add(colors.red('You are not connected to the internet.'))
    }

    spinner.stop()

    space()

    sticker.render()

    space()

    await this.#kernel.handle(args)
  }

  relativePath = (absolutePath: string) => {
    return relative(fileURLToPath(this.appRoot), absolutePath)
  }

  /**
   * Returns URL to a path from the application root.
   */
  makeURL = (...paths: string[]): URL => {
    return new URL(join(...paths), this.#appRoot)
  }

  /**
   * Returns file system path from the application root.
   */
  makePath = (...paths: string[]): string => {
    return fileURLToPath(this.makeURL(...paths))
  }

  installPKG = async (params: {
    cwd: string
    packageManager: PackageManager
    packages: { name: string; isDevDependency: boolean }[]
    verbose?: boolean
    enabled?: boolean
  }) => {
    if (params.enabled === false) {
      return
    }

    const devDependencies = params.packages
      .filter((pkg) => pkg.isDevDependency)
      .map(({ name }) => name)

    const dependencies = params.packages
      .filter((pkg) => !pkg.isDevDependency)
      .map(({ name }) => name)

    const installing = this.action('Installing packages')

    installing.started()

    try {
      await installPackage(devDependencies, {
        dev: true,
        cwd: params.cwd,
        silent: !params.verbose,
        packageManager: params.packageManager,
      })

      installing.progress('Installed dev dependencies')

      await installPackage(dependencies, {
        cwd: params.cwd,
        silent: !params.verbose,
        packageManager: params.packageManager,
      })

      space()

      installing.completed()
    } catch (error) {
      installing.failed(error)
      process.exit(1)
    }
  }

  runCMD = async (params: {
    message: string
    command: {
      main: string
      args?: string[]
    }
    active?: boolean
    verbose?: boolean
    cwd?: URL
  }) => {
    if (params.active === false) {
      return
    }

    const { logger } = this.#kernel.ui

    const runningCommand = this.action(params.message)

    runningCommand.started()

    const res = await x(params.command.main, params.command.args, {
      nodeOptions: {
        cwd: params.cwd,
        stdio: params.verbose ? 'inherit' : 'ignore',
      },
    })

    if (res.exitCode !== 0) {
      for (const line of res.stderr.split('\n')) {
        logger.error(line)
      }

      runningCommand.failed('Failed to run command')

      process.exit(1)
    }

    runningCommand.completed()
  }

  writeStub = async (params: {
    name: keyof STUBS
    data?: Record<string, any>
    destination: string
    compile?: boolean
  }) => {
    const writingStub = this.action(`Writing stub "${String(params.name)}"`)

    writingStub.started()

    try {
      if (!this.#stubs[params.name]) {
        return writingStub.failed(`Stub key "${String(params.name)}" does not exist`)
      }

      const path = this.makePath(String(this.#stubs[params.name]))

      if (!pathExists(path)) {
        return writingStub.failed(`Stub "${String(params.name)}" does not exist: ${path}`)
      }

      const stubData = await readFileOptional(path)

      if (!stubData) {
        return writingStub.failed(`Failed to read stub "${String(params.name)}"`)
      }

      let result = stubData

      if (params.compile !== false) {
        const render = compile(stubData, {
          props: params.data ? Object.keys(params.data) : undefined,
        })

        result = render(params.data)
      }

      const writeRes = await writeFileToPath(params.destination, result)

      if (!writeRes.success) {
        return writingStub.failed(writeRes.reason)
      }

      writingStub.completed()
    } catch (error) {
      writingStub.failed(error)
    }
  }
}
