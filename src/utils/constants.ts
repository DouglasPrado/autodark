/** Duração máxima de uma scene em segundos */
export const MAX_SCENE_DURATION = 2.5

/** Número máximo de tentativas de retry por step */
export const MAX_RETRY_ATTEMPTS = 3

/** Backoff de retry em ms: 1s, 2s, 4s */
export const RETRY_BACKOFF_MS = [1000, 2000, 4000] as const

/** Número mínimo de vídeos para ativar learning */
export const MIN_VIDEOS_FOR_LEARNING = 5

/** Resolução padrão do vídeo */
export const VIDEO_RESOLUTION = '1920x1080'

/** Formato de saída do vídeo */
export const VIDEO_FORMAT = 'mp4'

/** Resolução da thumbnail */
export const THUMBNAIL_RESOLUTION = '1280x720'

/** TTL do cache de assets em dias */
export const ASSET_CACHE_TTL_DAYS = 30

/** Limite de ajuste de pesos por operação */
export const MAX_WEIGHT_ADJUSTMENT = 0.1
