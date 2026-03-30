export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export interface LoggerOptions {
  write: (line: string) => void
  level: LogLevel
}

export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void
  info(message: string, data?: Record<string, unknown>): void
  warn(message: string, data?: Record<string, unknown>): void
  error(message: string, data?: Record<string, unknown>): void
  startStep(step: string): () => void
  child(context: Record<string, unknown>): Logger
}

export function createLogger(options: LoggerOptions, context: Record<string, unknown> = {}): Logger {
  const { write, level } = options
  const threshold = LOG_LEVELS[level]

  function log(lvl: LogLevel, message: string, data?: Record<string, unknown>) {
    if (LOG_LEVELS[lvl] < threshold) return

    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level: lvl,
      message,
      ...context,
      ...data,
    }

    if (data?.error instanceof Error) {
      entry.error = data.error.message
    }

    write(JSON.stringify(entry))
  }

  return {
    debug: (message, data) => log('debug', message, data),
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),

    startStep(step: string) {
      const start = performance.now()
      return () => {
        const durationMs = Math.round(performance.now() - start)
        log('info', `Step ${step} concluído`, { step, durationMs })
      }
    },

    child(childContext: Record<string, unknown>): Logger {
      return createLogger(options, { ...context, ...childContext })
    },
  }
}

export function createDefaultLogger(level: LogLevel = 'info'): Logger {
  return createLogger({
    write: (line) => console.log(line),
    level,
  })
}
