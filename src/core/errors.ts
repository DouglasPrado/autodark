export interface AppErrorOptions {
  retryable?: boolean
  cause?: Error
}

export class AppError extends Error {
  readonly code: string
  readonly retryable: boolean

  constructor(code: string, message: string, options?: AppErrorOptions) {
    super(message, { cause: options?.cause })
    this.name = 'AppError'
    this.code = code
    this.retryable = options?.retryable ?? false
  }
}

export class ValidationError extends AppError {
  constructor(code: string, message: string, options?: AppErrorOptions) {
    super(code, message, { ...options, retryable: false })
    this.name = 'ValidationError'
  }
}

export class EngineError extends AppError {
  constructor(code: string, message: string, options?: AppErrorOptions) {
    super(code, message, options)
    this.name = 'EngineError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(code: string, message: string, options?: AppErrorOptions) {
    super(code, message, { retryable: true, ...options })
    this.name = 'ExternalServiceError'
  }
}

export class PipelineError extends AppError {
  constructor(code: string, message: string, options?: AppErrorOptions) {
    super(code, message, options)
    this.name = 'PipelineError'
  }
}

export class ConfigError extends AppError {
  constructor(code: string, message: string, options?: AppErrorOptions) {
    super(code, message, { ...options, retryable: false })
    this.name = 'ConfigError'
  }
}
