import { Kernel as AceKernel } from '@adonisjs/ace'
import { CLI } from './cli.js'
import { BaseCommand, ListCommand } from './command.js'
import { CLIConfig } from '../config.js'

export class Kernel extends AceKernel<typeof BaseCommand> {
  constructor(cli: CLI<typeof CLIConfig.STUBS>) {
    super(ListCommand, {
      create: async (command, parsedOutput, $kernel) => {
        return new command(cli, $kernel, parsedOutput, $kernel.ui, $kernel.prompt)
      },

      run: (command) => command.exec(),
    })
  }
}
