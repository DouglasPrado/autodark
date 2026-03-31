import type { PipelineContext } from '../contracts/index.js'
import { PipelineStatus } from '../contracts/index.js'
import { createContext, nextContext } from './context.js'
import { withRetry, type RetryOptions } from '../utils/retry.js'
import { PipelineError } from './errors.js'
import type { Logger } from './logger.js'

export interface PipelineStep {
  name: string
  execute: (ctx: PipelineContext) => Promise<PipelineContext>
}

export interface PipelineRepository {
  save(ctx: PipelineContext): Promise<PipelineContext>
  findById(id: string): Promise<PipelineContext | null>
  update(id: string, data: Partial<PipelineContext>): Promise<PipelineContext>
}

export interface PipelineOrchestratorConfig {
  repo: PipelineRepository
  steps: PipelineStep[]
  logger: Logger
  retryOptions?: RetryOptions
}

export interface PipelineOrchestrator {
  execute(params: { niche: string; idea?: string }): Promise<PipelineContext>
  resume(pipelineId: string): Promise<PipelineContext>
}

export function createPipelineOrchestrator(config: PipelineOrchestratorConfig): PipelineOrchestrator {
  const { repo, steps, logger, retryOptions } = config

  async function runSteps(
    ctx: PipelineContext,
    stepsToRun: PipelineStep[],
  ): Promise<PipelineContext> {
    let current = ctx

    for (const step of stepsToRun) {
      const endStep = logger.startStep(step.name)
      try {
        current = await withRetry(
          () => step.execute(current),
          {
            ...retryOptions,
            onRetry: (attempt, error) => {
              logger.warn(`Retry step ${step.name}`, {
                attempt,
                error,
                pipelineId: current.id,
              })
              retryOptions?.onRetry?.(attempt, error)
            },
          },
        )
        endStep()

        current = nextContext(current, { lastCompletedStep: step.name } as any)
        await repo.update(current.id, { ...current })
      } catch (err) {
        endStep()
        const error = err instanceof Error ? err : new Error(String(err))
        logger.error(`Step ${step.name} falhou definitivamente`, {
          pipelineId: current.id,
          error,
        })

        const failed = nextContext(current, {
          status: PipelineStatus.FAILED,
          errorMessage: `Step ${step.name}: ${error.message}`,
        })
        await repo.update(failed.id, { status: failed.status, errorMessage: failed.errorMessage, updatedAt: failed.updatedAt })
        return failed
      }
    }

    const completed = nextContext(current, { status: PipelineStatus.COMPLETED })
    await repo.update(completed.id, { status: completed.status, updatedAt: completed.updatedAt })
    return completed
  }

  return {
    async execute(params) {
      const ctx = createContext({ niche: params.niche })
      logger.info('Pipeline iniciado', { pipelineId: ctx.id, niche: ctx.niche })

      const withIdea = params.idea
        ? nextContext(ctx, { manualIdea: params.idea } as any)
        : ctx

      const saved = await repo.save(withIdea)
      const running = nextContext(saved, { status: PipelineStatus.RUNNING })
      await repo.update(running.id, { status: running.status, updatedAt: running.updatedAt })

      return runSteps(running, steps)
    },

    async resume(pipelineId) {
      const existing = await repo.findById(pipelineId)
      if (!existing) {
        throw new PipelineError('PIPELINE_NOT_FOUND', `Pipeline ${pipelineId} não encontrado`)
      }

      if (existing.status !== PipelineStatus.FAILED && existing.status !== PipelineStatus.PAUSED) {
        throw new PipelineError(
          'INVALID_STATE_TRANSITION',
          `Não é possível resumir pipeline com status ${existing.status}`,
        )
      }

      logger.info('Pipeline resumido', { pipelineId, previousStatus: existing.status })

      const running = nextContext(existing, { status: PipelineStatus.RUNNING, errorMessage: undefined })
      await repo.update(running.id, { status: running.status, errorMessage: undefined, updatedAt: running.updatedAt })

      // Find the step to resume from
      const lastCompleted = (existing as any).lastCompletedStep as string | undefined
      let startIndex = 0
      if (lastCompleted) {
        const idx = steps.findIndex((s) => s.name === lastCompleted)
        if (idx >= 0) startIndex = idx + 1
      }

      const remainingSteps = steps.slice(startIndex)
      return runSteps(running, remainingSteps)
    },
  }
}
