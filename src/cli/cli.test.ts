import { describe, it, expect } from 'vitest'
import { createProgram } from './index.js'

describe('CLI', () => {
  it('creates program with correct name and version', () => {
    const program = createProgram()
    expect(program.name()).toBe('mestra')
    expect(program.version()).toBeDefined()
  })

  it('has generate command', () => {
    const program = createProgram()
    const cmd = program.commands.find((c) => c.name() === 'generate')
    expect(cmd).toBeDefined()
    expect(cmd!.description()).toContain('vídeo')
  })

  it('has status command', () => {
    const program = createProgram()
    const cmd = program.commands.find((c) => c.name() === 'status')
    expect(cmd).toBeDefined()
  })

  it('has videos command', () => {
    const program = createProgram()
    const cmd = program.commands.find((c) => c.name() === 'videos')
    expect(cmd).toBeDefined()
  })

  it('has config command', () => {
    const program = createProgram()
    const cmd = program.commands.find((c) => c.name() === 'config')
    expect(cmd).toBeDefined()
  })

  it('has start command', () => {
    const program = createProgram()
    const cmd = program.commands.find((c) => c.name() === 'start')
    expect(cmd).toBeDefined()
    expect(cmd!.description()).toContain('scheduler')
  })

  it('generate command requires --niche option', () => {
    const program = createProgram()
    const cmd = program.commands.find((c) => c.name() === 'generate')!
    const nicheOpt = cmd.options.find((o) => o.long === '--niche')
    expect(nicheOpt).toBeDefined()
    expect(nicheOpt!.required).toBe(true)
  })
})
