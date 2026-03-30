import { MAX_RETRY_ATTEMPTS, RETRY_BACKOFF_MS } from './constants.js'

export interface RetryOptions {
  maxAttempts?: number
  backoffMs?: readonly number[]
  onRetry?: (attempt: number, error: Error) => void
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? MAX_RETRY_ATTEMPTS
  const backoffMs = options?.backoffMs ?? RETRY_BACKOFF_MS
  const onRetry = options?.onRetry

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      if (attempt < maxAttempts) {
        onRetry?.(attempt, lastError)
        const delay = backoffMs[attempt - 1] ?? backoffMs[backoffMs.length - 1] ?? 0
        if (delay > 0) await sleep(delay)
      }
    }
  }

  throw lastError!
}
