import type { Command } from 'commander'
import { loadConfig } from '../../infrastructure/config.js'
import { createDefaultLogger } from '../../core/logger.js'
import { createDatabaseClient } from '../../infrastructure/database/client.js'
import { createVideoMetricsRepository } from '../../infrastructure/database/repositories/metrics.js'
import { createLearningStateRepository } from '../../infrastructure/database/repositories/learning-state.js'
import { createPipelineRepository } from '../../infrastructure/database/repositories/pipeline.js'
import { createMockYouTubeAnalyticsClient, createYouTubeAnalyticsClient } from '../../services/youtube-analytics.js'
import { createPerformanceEngine } from '../../engines/performance/index.js'
import { createLearningEngine } from '../../engines/learning/index.js'
import { createDefaultWeights } from '../../engines/learning/weights.js'
import { createScheduler } from '../../infrastructure/scheduler/cron.js'

export function registerStartCommand(program: Command): void {
  program
    .command('start')
    .description('Iniciar scheduler de métricas e learning em background')
    .action(async () => {
      const config = loadConfig()
      const logger = createDefaultLogger(config.logLevel)
      const db = createDatabaseClient()

      try {
        await db.connect()
        logger.info('Mestra AI Scheduler iniciando')

        const pipelineRepo = createPipelineRepository(db.prisma)
        const metricsRepo = createVideoMetricsRepository(db.prisma)
        const learningRepo = createLearningStateRepository(db.prisma)

        const analytics = config.youtubeClientId
          ? createYouTubeAnalyticsClient({
              clientId: config.youtubeClientId,
              clientSecret: config.youtubeClientSecret!,
              refreshToken: config.youtubeRefreshToken!,
            })
          : createMockYouTubeAnalyticsClient()

        const performanceEngine = createPerformanceEngine({ analytics })
        const learningEngine = createLearningEngine()

        const scheduler = createScheduler(logger)

        // Metrics collection job
        scheduler.register({
          name: 'metrics-collection',
          schedule: config.metricsCron,
          async task() {
            logger.info('Coletando métricas do YouTube')
            const pipelines = await db.prisma.pipeline.findMany({
              where: { status: 'completed', videoId: { not: null } },
              orderBy: { createdAt: 'desc' },
              take: 50,
            })

            let collected = 0
            for (const p of pipelines) {
              if (!p.videoId) continue
              const existing = await metricsRepo.findByPipelineId(p.id)
              if (existing && existing.status === 'collected') continue

              const result = await performanceEngine.collect({
                youtubeVideoId: p.videoId,
                pipelineId: p.id,
                publishedAt: p.createdAt,
              })
              await metricsRepo.save(result.metrics)
              collected++
            }
            logger.info('Métricas coletadas', { collected, total: pipelines.length })
          },
        })

        // Learning loop job
        scheduler.register({
          name: 'learning-loop',
          schedule: config.learningCron,
          async task() {
            logger.info('Executando learning loop')
            const recentMetrics = await metricsRepo.findRecent(20)
            if (recentMetrics.length === 0) {
              logger.info('Sem métricas para learning')
              return
            }

            const niches = [...new Set(recentMetrics.map((m) => {
              // Get niche from pipeline
              return 'dark' // TODO: join with pipeline to get niche
            }))]

            for (const niche of niches) {
              let state = await learningRepo.findByNiche(niche)
              if (!state) state = createDefaultWeights(niche)

              const result = learningEngine.process(state, recentMetrics)
              await learningRepo.upsert(result.state)
              logger.info('Learning atualizado', {
                niche,
                analyzedVideos: result.state.analyzedVideos,
                isActive: result.state.isActive,
              })
            }
          },
        })

        scheduler.start()

        console.log('\nMestra AI Scheduler rodando')
        console.log(`  Métricas:  ${config.metricsCron}`)
        console.log(`  Learning:  ${config.learningCron}`)
        console.log('\nCtrl+C para parar\n')

        // Keep alive
        const shutdown = async () => {
          logger.info('Encerrando scheduler')
          scheduler.stop()
          await db.disconnect()
          process.exit(0)
        }
        process.on('SIGINT', shutdown)
        process.on('SIGTERM', shutdown)

      } catch (err) {
        console.error('Erro ao iniciar scheduler:', err instanceof Error ? err.message : err)
        await db.disconnect()
        process.exitCode = 1
      }
    })
}
