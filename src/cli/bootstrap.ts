import { loadConfig } from '../infrastructure/config.js'
import { createDefaultLogger } from '../core/logger.js'
import { createDatabaseClient } from '../infrastructure/database/client.js'
import { createPipelineRepository } from '../infrastructure/database/repositories/pipeline.js'
import { createVideoMetricsRepository } from '../infrastructure/database/repositories/metrics.js'
import { createLearningStateRepository } from '../infrastructure/database/repositories/learning-state.js'
import { createOpenRouterClient } from '../services/openrouter.js'
import { createElevenLabsClient } from '../services/elevenlabs.js'
import { createPexelsClient } from '../services/pexels.js'
import { createFFmpegClient } from '../services/ffmpeg.js'
import { createImageAIClient } from '../services/image-ai.js'
import { createMockYouTubeClient } from '../services/youtube-upload.js'
import { createMockYouTubeAnalyticsClient } from '../services/youtube-analytics.js'
import { createPipelineOrchestrator } from '../core/pipeline.js'
import { createPipelineSteps, type PipelineClients } from '../services/pipeline-steps.js'
import { createFileStorage } from '../infrastructure/storage/files.js'
import type { Logger } from '../core/logger.js'
import type { PipelineOrchestrator } from '../core/pipeline.js'

export interface AppContext {
  logger: Logger
  orchestrator: PipelineOrchestrator
  disconnect(): Promise<void>
}

export async function bootstrap(): Promise<AppContext> {
  const config = loadConfig()
  const logger = createDefaultLogger(config.logLevel)

  logger.info('Inicializando Mestra AI', { logLevel: config.logLevel })

  // Database
  const db = createDatabaseClient()
  await db.connect()
  const pipelineRepo = createPipelineRepository(db.prisma)

  // Storage
  const storage = createFileStorage()
  await storage.ensureDir(config.storagePath)

  // API Clients
  const clients: PipelineClients = {
    llm: createOpenRouterClient({ apiKey: config.openrouterApiKey }),
    tts: createElevenLabsClient({ apiKey: config.elevenlabsApiKey }),
    pexels: createPexelsClient({ apiKey: config.pexelsApiKey }),
    ffmpeg: createFFmpegClient(),
    imageAI: createImageAIClient({ apiKey: config.openrouterApiKey }),
    youtube: createMockYouTubeClient(), // TODO: replace with real client when OAuth configured
  }

  // Pipeline
  const steps = createPipelineSteps({
    clients,
    voiceId: config.elevenlabsVoiceId,
    storagePath: config.storagePath,
    outputDir: `${config.storagePath}/output`,
  })

  const orchestrator = createPipelineOrchestrator({
    repo: pipelineRepo,
    steps,
    logger,
  })

  logger.info('Mestra AI pronto')

  return {
    logger,
    orchestrator,
    async disconnect() {
      await db.disconnect()
    },
  }
}
