import {
  BaseCommand as AceBaseCommand,
  ListCommand as AceListCommand,
  HelpCommand as AceHelpCommand,
} from '@adonisjs/ace'
import { CLI } from './cli.js'
import { ParsedOutput, UIPrimitives } from '@adonisjs/ace/types'
import { Kernel } from './kernel.js'
import { CLIConfig } from '../config.js'

type CLIT = CLI<typeof CLIConfig.STUBS>

export class BaseCommand extends AceBaseCommand {
  constructor(
    public cli: CLIT,
    public kernel: Kernel,
    parsed: ParsedOutput,
    ui: UIPrimitives,
    prompt: Kernel['prompt']
  ) {
    super(kernel, parsed, ui, prompt)
  }
}

export class ListCommand extends AceListCommand implements BaseCommand {
  constructor(
    public cli: CLIT,
    public kernel: Kernel,
    parsed: ParsedOutput,
    ui: UIPrimitives,
    prompt: Kernel['prompt']
  ) {
    super(kernel, parsed, ui, prompt)
  }
}

export class HelpCommand extends AceHelpCommand implements BaseCommand {
  constructor(
    public cli: CLIT,
    public kernel: Kernel,
    parsed: ParsedOutput,
    ui: UIPrimitives,
    prompt: Kernel['prompt']
  ) {
    super(kernel, parsed, ui, prompt)
  }
}
