import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLogger, type Logger } from './logger.js'

describe('Logger', () => {
  let logger: Logger
  let output: string[]

  beforeEach(() => {
    output = []
    logger = createLogger({
      write: (line: string) => output.push(line),
      level: 'info',
    })
  })

  it('logs info messages as structured JSON', () => {
    logger.info('Pipeline iniciado', { niche: 'dark' })
    expect(output).toHaveLength(1)
    const parsed = JSON.parse(output[0]!)
    expect(parsed.level).toBe('info')
    expect(parsed.message).toBe('Pipeline iniciado')
    expect(parsed.niche).toBe('dark')
    expect(parsed.timestamp).toBeDefined()
  })

  it('logs error messages with error details', () => {
    const error = new Error('falha')
    logger.error('Step falhou', { step: 'content', error })
    const parsed = JSON.parse(output[0]!)
    expect(parsed.level).toBe('error')
    expect(parsed.step).toBe('content')
    expect(parsed.error).toBe('falha')
  })

  it('logs warn messages', () => {
    logger.warn('Retry attempt', { attempt: 2 })
    const parsed = JSON.parse(output[0]!)
    expect(parsed.level).toBe('warn')
    expect(parsed.attempt).toBe(2)
  })

  it('logs debug messages only when level is debug', () => {
    logger.debug('detalhe interno')
    expect(output).toHaveLength(0)

    const debugLogger = createLogger({ write: (line) => output.push(line), level: 'debug' })
    debugLogger.debug('detalhe interno')
    expect(output).toHaveLength(1)
  })

  it('measures step duration', async () => {
    const end = logger.startStep('content')
    await new Promise((r) => setTimeout(r, 50))
    end()
    const parsed = JSON.parse(output[0]!)
    expect(parsed.level).toBe('info')
    expect(parsed.step).toBe('content')
    expect(parsed.durationMs).toBeGreaterThanOrEqual(40)
    expect(parsed.message).toContain('content')
  })

  it('creates child logger with context', () => {
    const child = logger.child({ pipelineId: 'abc-123' })
    child.info('step executado')
    const parsed = JSON.parse(output[0]!)
    expect(parsed.pipelineId).toBe('abc-123')
    expect(parsed.message).toBe('step executado')
  })
})
