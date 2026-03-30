import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  EngineError,
  ExternalServiceError,
  PipelineError,
  ConfigError,
} from './errors.js'

describe('AppError', () => {
  it('creates error with code and message', () => {
    const error = new AppError('TEST_ERROR', 'test message')
    expect(error.code).toBe('TEST_ERROR')
    expect(error.message).toBe('test message')
    expect(error.name).toBe('AppError')
    expect(error instanceof Error).toBe(true)
  })

  it('supports retryable flag', () => {
    const error = new AppError('RETRY', 'retry me', { retryable: true })
    expect(error.retryable).toBe(true)
  })

  it('defaults retryable to false', () => {
    const error = new AppError('NO_RETRY', 'no retry')
    expect(error.retryable).toBe(false)
  })

  it('captures cause', () => {
    const cause = new Error('root cause')
    const error = new AppError('WRAP', 'wrapped', { cause })
    expect(error.cause).toBe(cause)
  })
})

describe('ValidationError', () => {
  it('creates with VALIDATION_ prefix convention', () => {
    const error = new ValidationError('INVALID_NICHE', 'Nicho inválido')
    expect(error.code).toBe('INVALID_NICHE')
    expect(error.name).toBe('ValidationError')
    expect(error instanceof AppError).toBe(true)
    expect(error.retryable).toBe(false)
  })
})

describe('EngineError', () => {
  it('creates engine-specific error', () => {
    const error = new EngineError('CONTENT_GENERATION_FAILED', 'Falha ao gerar conteúdo')
    expect(error.name).toBe('EngineError')
    expect(error instanceof AppError).toBe(true)
  })
})

describe('ExternalServiceError', () => {
  it('is retryable by default', () => {
    const error = new ExternalServiceError('LLM_TIMEOUT', 'OpenRouter timeout')
    expect(error.retryable).toBe(true)
    expect(error.name).toBe('ExternalServiceError')
    expect(error instanceof AppError).toBe(true)
  })
})

describe('PipelineError', () => {
  it('creates pipeline-specific error', () => {
    const error = new PipelineError('STEP_FAILED', 'Step content falhou')
    expect(error.name).toBe('PipelineError')
    expect(error instanceof AppError).toBe(true)
  })
})

describe('ConfigError', () => {
  it('creates config-specific error', () => {
    const error = new ConfigError('MISSING_ENV', 'OPENROUTER_API_KEY não definida')
    expect(error.name).toBe('ConfigError')
    expect(error instanceof AppError).toBe(true)
    expect(error.retryable).toBe(false)
  })
})
