#!/usr/bin/env node

import { CLI } from './src/cli.js'
import { Transform } from './src/commands/transform.js'
import { Mantle } from './src/commands/template/mantle.js'
import { CLIConfig } from './config.js'

const cli = new CLI({
  appRoot: new URL('./', import.meta.url),
  commands: [Transform, Mantle],
  stubs: CLIConfig.STUBS,
})

await cli.run(process.argv.splice(2))
