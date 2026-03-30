import { z } from 'zod'
import { ConfigError } from '../core/errors.js'

const configSchema = z.object({
  databaseUrl: z.string().min(1),
  openrouterApiKey: z.string().min(1),
  elevenlabsApiKey: z.string().min(1),
  elevenlabsVoiceId: z.string().min(1),
  pexelsApiKey: z.string().min(1),
  youtubeClientId: z.string().optional(),
  youtubeClientSecret: z.string().optional(),
  youtubeRedirectUri: z.string().optional(),
  youtubeRefreshToken: z.string().optional(),
  storagePath: z.string().default('./storage'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  metricsCron: z.string().default('0 */6 * * *'),
  learningCron: z.string().default('0 0 * * *'),
})

export type Config = z.infer<typeof configSchema>

export function loadConfig(): Config {
  const result = configSchema.safeParse({
    databaseUrl: process.env.DATABASE_URL,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
    elevenlabsVoiceId: process.env.ELEVENLABS_VOICE_ID,
    pexelsApiKey: process.env.PEXELS_API_KEY,
    youtubeClientId: process.env.YOUTUBE_CLIENT_ID,
    youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    youtubeRedirectUri: process.env.YOUTUBE_REDIRECT_URI,
    youtubeRefreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
    storagePath: process.env.STORAGE_PATH,
    logLevel: process.env.LOG_LEVEL,
    metricsCron: process.env.METRICS_CRON,
    learningCron: process.env.LEARNING_CRON,
  })

  if (!result.success) {
    const missing = result.error.issues
      .map((i) => i.path.join('.'))
      .join(', ')
    throw new ConfigError(
      'INVALID_CONFIG',
      `Configuração inválida. Campos com erro: ${missing}. Verifique seu .env`,
    )
  }

  return result.data
}
