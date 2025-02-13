import { hasPackageManager } from '../../lib/package_manager.js'
import { BaseCommand } from '../../command.js'
import { rm } from 'node:fs/promises'
import { pathExists } from '../../lib/fs.js'
import { args, flags } from '@adonisjs/ace'
import { capitalCase, kebabCase } from 'case-anything'
import { space } from '../../lib/space.js'
import { PackageManager } from '@antfu/install-pkg'
import { PackageJSON } from '../../lib/json/package_json.js'
import { TSConfig } from '../../lib/json/tsconfig.js'

export class Mantle extends BaseCommand {
  static commandName: string = 'template:mantle'
  static description: string = 'Setup a new Mantle project'

  @args.string({
    argumentName: 'Project Name',
    description: 'The name of the project (hello-world)',
    parse: (i) => (i ? kebabCase(i) : i),
    required: false,
  })
  declare projectName?: string

  @flags.string({
    description: "The project's description",
    flagName: 'description',
    required: false,
  })
  declare projectDescription?: string

  @flags.boolean({
    flagName: 'use-npm',
    description: 'Use NPM as the package manager',
    required: false,
  })
  declare useNpm?: boolean

  @flags.boolean({
    flagName: 'use-pnpm',
    description: 'Use PNPM as the package manager',
    required: false,
  })
  declare usePnpm?: boolean

  @flags.boolean({
    flagName: 'use-yarn',
    description: 'Use Yarn as the package manager',
    required: false,
  })
  declare useYarn?: boolean

  @flags.boolean({
    flagName: 'use-bun',
    description: 'Use Bun as the package manager',
    required: false,
  })
  declare useBun?: boolean

  async run() {
    if (!(await hasPackageManager('npx'))) {
      return this.logger.error('npx is not installed')
    }

    if (!this.projectName) {
      this.projectName = await this.prompt.ask('What is your project name?', {
        default: 'hello-world',
        result: (s) => kebabCase(s),
      })
    }

    if (this.projectName.length < 1) {
      return this.logger.error('project name cannot be empty')
    }

    if (this.projectName.length > 20) {
      return this.logger.error('project name cannot be longer than 20 characters')
    }

    const projectName = this.projectName

    if (pathExists(projectName)) {
      return this.logger.error(`folder "${projectName}" already exists`)
    }

    if (!this.projectDescription) {
      this.projectDescription = await this.prompt.ask('What is your project description?', {
        default: "Don't build from scratch",
      })
    }

    if (this.projectDescription.length < 1) {
      return this.logger.error('project description cannot be empty')
    }

    if (this.projectDescription.length > 50) {
      return this.logger.error('project description cannot be longer than 50 characters')
    }

    const projectDescription = this.projectDescription

    let packageManager: PackageManager = 'npm'

    if (this.useNpm) {
      packageManager = 'npm'
    } else if (this.usePnpm) {
      packageManager = 'pnpm'
    } else if (this.useYarn) {
      packageManager = 'yarn'
    } else if (this.useBun) {
      packageManager = 'bun'
    } else {
      packageManager = await this.prompt.choice('Which package manager would you like to use?', [
        'npm',
        'pnpm',
        'bun',
        'yarn',
      ])
    }

    if (!(await hasPackageManager(packageManager))) {
      return this.logger.error(`Package manager "${packageManager}" is not installed`)
    }

    space()

    const sticker = this.kernel.ui.sticker()

    sticker
      .fullScreen()
      .heading('Setting up Mantle')
      .add(`Project Name:     ${this.colors.green(projectName)}`)
      .add(`Package Manager:  ${this.colors.green(packageManager)}`)
      .render()

    const projectSetup = this.cli.action('Setting up Mantle')

    projectSetup.started()

    await this.cli.runCMD({
      message: 'Creating Mantle base',
      command: {
        main: 'npx',
        args: [
          'create-next-app@latest',
          projectName,
          '--ts',
          '--eslint',
          '--src-dir',
          '--no-turbopack',
          '--no-tailwind',
          '--no-app',
          '--import-alias=@/*',
          `--use-${packageManager}`,
          '--disable-git',
        ],
      },
    })

    const projectPath = `${process.cwd()}/${projectName}`

    await this.cli.installPKG({
      cwd: projectPath,
      packageManager,
      packages: [
        {
          name: '@mantine/core',
          isDevDependency: false,
        },
        {
          name: '@mantine/hooks',
          isDevDependency: false,
        },
        {
          name: '@mantine/nprogress',
          isDevDependency: false,
        },
        {
          name: '@mantine/dates',
          isDevDependency: false,
        },
        {
          name: '@mantine/form',
          isDevDependency: false,
        },
        {
          name: '@mantine/modals',
          isDevDependency: false,
        },
        {
          name: '@mantine/notifications',
          isDevDependency: false,
        },
        {
          name: '@tanstack/react-query',
          isDevDependency: false,
        },
        {
          name: 'dayjs',
          isDevDependency: false,
        },
        {
          name: 'postcss',
          isDevDependency: true,
        },
        {
          name: 'postcss-preset-mantine',
          isDevDependency: true,
        },
        {
          name: 'postcss-simple-vars',
          isDevDependency: true,
        },
        {
          name: 'next-seo',
          isDevDependency: false,
        },
        {
          name: '@folie/cobalt',
          isDevDependency: false,
        },
        {
          name: '@folie/gate',
          isDevDependency: false,
        },
        {
          name: '@tabler/icons-react',
          isDevDependency: false,
        },
        {
          name: '@folie/cobalt-animation',
          isDevDependency: false,
        },
        {
          name: 'motion',
          isDevDependency: false,
        },
      ],
    })

    await Promise.all([
      rm(`${projectPath}/public`, { force: true, recursive: true }),
      rm(`${projectPath}/src/pages/api`, { force: true, recursive: true }),
      rm(`${projectPath}/src/styles`, { force: true, recursive: true }),
    ])

    projectSetup.progress('Removed unnecessary files & folders')

    await this.cli.writeStub({
      name: 'mantle-postcss-config',
      destination: `${projectPath}/postcss.config.cjs`,
      compile: false,
    })

    await this.cli.writeStub({
      name: 'mantle-config-index',
      destination: `${projectPath}/src/configs/index.ts`,
      compile: false,
    })

    await this.cli.writeStub({
      name: 'mantle-config-font',
      destination: `${projectPath}/src/configs/font.ts`,
      compile: false,
    })

    await this.cli.writeStub({
      name: 'mantle-config-theme',
      destination: `${projectPath}/src/configs/theme.ts`,
      compile: false,
    })

    await this.cli.writeStub({
      name: 'mantle-page-document',
      destination: `${projectPath}/src/pages/_document.tsx`,
      compile: false,
    })

    await this.cli.writeStub({
      name: 'mantle-page-app',
      destination: `${projectPath}/src/pages/_app.tsx`,
      data: {
        project: {
          name: capitalCase(projectName),
          description: projectDescription,
        },
      },
    })

    await this.cli.writeStub({
      name: 'mantle-page-index',
      destination: `${projectPath}/src/pages/index.tsx`,
      compile: false,
    })

    await this.cli.writeStub({
      name: 'mantle-readme',
      destination: `${projectPath}/README.md`,
      data: {
        project: {
          name: capitalCase(projectName),
          description: projectDescription,
        },
      },
    })

    await this.cli.writeStub({
      name: 'mantle-next-config',
      destination: `${projectPath}/next.config.ts`,
      compile: false,
    })

    projectSetup.progress('Wrote required files & folders')

    const packageJSON = new PackageJSON(`${projectPath}/package.json`)

    await packageJSON.sync()

    packageJSON.setDescription(projectDescription)

    packageJSON.addScript('typecheck', 'tsc --noEmit')
    packageJSON.addScript('format', 'prettier --write "**/*.{ts,tsx,md,json}"')

    await packageJSON.save()

    const tsConfig = new TSConfig(`${projectPath}/tsconfig.json`)

    await tsConfig.sync()

    tsConfig.addCompilerOption('experimentalDecorators', true)

    await tsConfig.save()

    projectSetup.progress('Configured project')

    space()

    projectSetup.completed()
  }
}
