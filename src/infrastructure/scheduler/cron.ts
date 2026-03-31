import cron from 'node-cron'
import type { Logger } from '../../core/logger.js'

export interface CronJob {
  name: string
  schedule: string
  task: () => Promise<void>
}

export interface Scheduler {
  register(job: CronJob): void
  start(): void
  stop(): void
}

export function createScheduler(logger: Logger): Scheduler {
  const tasks: cron.ScheduledTask[] = []

  return {
    register(job: CronJob) {
      const task = cron.schedule(job.schedule, async () => {
        const end = logger.startStep(job.name)
        try {
          await job.task()
          end()
        } catch (err) {
          end()
          logger.error(`Cron job ${job.name} falhou`, {
            error: err instanceof Error ? err : new Error(String(err)),
          })
        }
      }, { scheduled: false })

      tasks.push(task)
      logger.info(`Cron registrado: ${job.name}`, { schedule: job.schedule })
    },

    start() {
      tasks.forEach((t) => t.start())
      logger.info('Scheduler iniciado', { jobs: tasks.length })
    },

    stop() {
      tasks.forEach((t) => t.stop())
      logger.info('Scheduler parado')
    },
  }
}
