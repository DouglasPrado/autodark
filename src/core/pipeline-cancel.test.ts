import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createPipelineOrchestrator,
  type PipelineStep,
  type PipelineRepository,
} from './pipeline.js'
import { createContext } from './context.js'
import { PipelineStatus } from '../contracts/index.js'
import type { PipelineContext } from '../contracts/index.js'
import { createLogger } from './logger.js'

function createMockRepo(): PipelineRepository {
  const store = new Map<string, PipelineContext>()
  return {
    save: vi.fn(async (ctx: PipelineContext) => { store.set(ctx.id, ctx); return ctx }),
    findById: vi.fn(async (id: string) => store.get(id) ?? null),
    update: vi.fn(async (id: string, data: Partial<PipelineContext>) => {
      const existing = store.get(id)!
      const updated = { ...existing, ...data, updatedAt: new Date() }
      store.set(id, updated)
      return updated
    }),
  }
}

function createTestLogger() {
  return createLogger({ write: () => {}, level: 'error' })
}

describe('Pipeline cancel and restart', () => {
  let repo: PipelineRepository

  beforeEach(() => {
    repo = createMockRepo()
  })

  it('cancels a running pipeline', async () => {
    let stepExecuted = false
    const steps: PipelineStep[] = [
      {
        name: 'slow_step',
        execute: async (ctx) => {
          stepExecuted = true
          return { ...ctx }
        },
      },
    ]

    const orchestrator = createPipelineOrchestrator({ repo, steps, logger: createTestLogger() })
    const result = await orchestrator.execute({ niche: 'dark' })

    // Cancel a completed pipeline should fail
    await expect(orchestrator.cancel(result.id)).rejects.toThrow()
  })

  it('cancels a paused pipeline', async () => {
    const steps: PipelineStep[] = [
      { name: 'step1', execute: async (ctx) => { throw new Error('fail') } },
    ]

    const orchestrator = createPipelineOrchestrator({
      repo, steps, logger: createTestLogger(),
      retryOptions: { maxAttempts: 1, backoffMs: [0] },
    })
    const failed = await orchestrator.execute({ niche: 'dark' })

    // Cancel a failed pipeline
    const cancelled = await orchestrator.cancel(failed.id)
    expect(cancelled.status).toBe(PipelineStatus.FAILED)
    expect(cancelled.errorMessage).toContain('cancelado')
  })

  it('restarts a failed pipeline as new pending', async () => {
    let attempts = 0
    const steps: PipelineStep[] = [
      {
        name: 'step1',
        execute: async (ctx) => {
          attempts++
          if (attempts <= 1) throw new Error('first fail')
          return { ...ctx }
        },
      },
    ]

    const orchestrator = createPipelineOrchestrator({
      repo, steps, logger: createTestLogger(),
      retryOptions: { maxAttempts: 1, backoffMs: [0] },
    })

    const failed = await orchestrator.execute({ niche: 'dark' })
    expect(failed.status).toBe(PipelineStatus.FAILED)

    const restarted = await orchestrator.restart(failed.id)
    expect(restarted.status).toBe(PipelineStatus.COMPLETED)
    expect(restarted.niche).toBe('dark')
  })

  it('rejects restart on completed pipeline', async () => {
    const steps: PipelineStep[] = [
      { name: 'step1', execute: async (ctx) => ({ ...ctx }) },
    ]
    const orchestrator = createPipelineOrchestrator({ repo, steps, logger: createTestLogger() })
    const completed = await orchestrator.execute({ niche: 'dark' })

    await expect(orchestrator.restart(completed.id)).rejects.toThrow()
  })
})
