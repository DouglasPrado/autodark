#!/usr/bin/env node
import { Command } from 'commander'
import { registerGenerateCommand } from './commands/generate.js'
import { registerStatusCommand } from './commands/status.js'
import { registerVideosCommand } from './commands/videos.js'
import { registerConfigCommand } from './commands/config.js'

export function createProgram(): Command {
  const program = new Command()

  program
    .name('mestra')
    .version('0.1.0')
    .description('Mestra AI — Sistema autônomo de crescimento de canal YouTube')

  registerGenerateCommand(program)
  registerStatusCommand(program)
  registerVideosCommand(program)
  registerConfigCommand(program)

  return program
}

const isMain = process.argv[1]?.includes('cli/index')
if (isMain) {
  const program = createProgram()
  program.parse()
}
