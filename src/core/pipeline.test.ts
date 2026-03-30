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

describe('PipelineOrchestrator', () => {
  let repo: PipelineRepository

  beforeEach(() => {
    repo = createMockRepo()
  })

  it('executes steps sequentially and returns completed context', async () => {
    const steps: PipelineStep[] = [
      { name: 'step1', execute: async (ctx) => ({ ...ctx, idea: { id: '1', niche: ctx.niche, text: 'idea', source: 'manual' as const, createdAt: new Date() } }) },
      { name: 'step2', execute: async (ctx) => ({ ...ctx, videoPath: '/tmp/video.mp4' }) },
    ]

    const orchestrator = createPipelineOrchestrator({ repo, steps, logger: createTestLogger() })
    const result = await orchestrator.execute({ niche: 'dark' })

    expect(result.status).toBe(PipelineStatus.COMPLETED)
    expect(result.idea).toBeDefined()
    expect(result.videoPath).toBe('/tmp/video.mp4')
  })

  it('persists state after each step', async () => {
    const steps: PipelineStep[] = [
      { name: 'step1', execute: async (ctx) => ({ ...ctx }) },
      { name: 'step2', execute: async (ctx) => ({ ...ctx }) },
    ]

    const orchestrator = createPipelineOrchestrator({ repo, steps, logger: createTestLogger() })
    await orchestrator.execute({ niche: 'dark' })

    // save (initial) + update after step1 + update after step2 + update (completed)
    expect(repo.save).toHaveBeenCalledTimes(1)
    expect(repo.update).toHaveBeenCalled()
  })

  it('retries failed step up to 3 times', async () => {
    let attempts = 0
    const steps: PipelineStep[] = [
      {
        name: 'flaky',
        execute: async (ctx) => {
          attempts++
          if (attempts < 3) throw new Error('transient')
          return { ...ctx }
        },
      },
    ]

    const orchestrator = createPipelineOrchestrator({
      repo, steps, logger: createTestLogger(),
      retryOptions: { maxAttempts: 3, backoffMs: [0, 0, 0] },
    })
    const result = await orchestrator.execute({ niche: 'dark' })
    expect(result.status).toBe(PipelineStatus.COMPLETED)
    expect(attempts).toBe(3)
  })

  it('marks pipeline as failed after max retries', async () => {
    const steps: PipelineStep[] = [
      { name: 'always_fails', execute: async () => { throw new Error('permanent') } },
    ]

    const orchestrator = createPipelineOrchestrator({
      repo, steps, logger: createTestLogger(),
      retryOptions: { maxAttempts: 3, backoffMs: [0, 0, 0] },
    })
    const result = await orchestrator.execute({ niche: 'dark' })
    expect(result.status).toBe(PipelineStatus.FAILED)
    expect(result.errorMessage).toContain('permanent')
  })

  it('transitions pending → running → completed', async () => {
    const statuses: string[] = []
    const mockRepo = createMockRepo()
    const origSave = mockRepo.save as any
    mockRepo.save = vi.fn(async (ctx: PipelineContext) => {
      statuses.push(ctx.status)
      return origSave(ctx)
    })
    const origUpdate = mockRepo.update as any
    mockRepo.update = vi.fn(async (id: string, data: Partial<PipelineContext>) => {
      if (data.status) statuses.push(data.status)
      return origUpdate(id, data)
    })

    const steps: PipelineStep[] = [
      { name: 'step1', execute: async (ctx) => ({ ...ctx }) },
    ]

    const orchestrator = createPipelineOrchestrator({ repo: mockRepo, steps, logger: createTestLogger() })
    await orchestrator.execute({ niche: 'dark' })

    expect(statuses).toContain(PipelineStatus.RUNNING)
    expect(statuses[statuses.length - 1]).toBe(PipelineStatus.COMPLETED)
  })

  it('resumes pipeline from failed step', async () => {
    let callCount = 0
    const steps: PipelineStep[] = [
      { name: 'step1', execute: async (ctx) => ({ ...ctx, videoPath: '/done' }) },
      {
        name: 'step2',
        execute: async (ctx) => {
          callCount++
          if (callCount === 1) throw new Error('first run fails')
          return { ...ctx }
        },
      },
    ]

    const orchestrator = createPipelineOrchestrator({
      repo, steps, logger: createTestLogger(),
      retryOptions: { maxAttempts: 1, backoffMs: [0] },
    })

    // First run fails at step2
    const failed = await orchestrator.execute({ niche: 'dark' })
    expect(failed.status).toBe(PipelineStatus.FAILED)

    // Resume from failure
    const resumed = await orchestrator.resume(failed.id)
    expect(resumed.status).toBe(PipelineStatus.COMPLETED)
    expect(resumed.videoPath).toBe('/done') // step1 result preserved
  })

  it('rejects invalid state transitions', async () => {
    const steps: PipelineStep[] = [
      { name: 'step1', execute: async (ctx) => ({ ...ctx }) },
    ]

    const orchestrator = createPipelineOrchestrator({ repo, steps, logger: createTestLogger() })
    const result = await orchestrator.execute({ niche: 'dark' })

    // completed → resume should fail
    await expect(orchestrator.resume(result.id)).rejects.toThrow()
  })
})
