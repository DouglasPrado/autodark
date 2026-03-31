export interface AnalyticsMetrics {
  views: number
  likes: number
  comments: number
  retention: number
  ctr: number
  avgWatchTime: number
}

export interface YouTubeAnalyticsClient {
  getVideoMetrics(videoId: string): Promise<AnalyticsMetrics>
  getRetentionCurve(videoId: string): Promise<number[]>
}

export interface YouTubeAnalyticsConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
}

export function createYouTubeAnalyticsClient(_config: YouTubeAnalyticsConfig): YouTubeAnalyticsClient {
  return {
    async getVideoMetrics(_videoId) {
      throw new Error('YouTube Analytics requires OAuth2 configuration — use mock for tests')
    },
    async getRetentionCurve(_videoId) {
      throw new Error('YouTube Analytics requires OAuth2 configuration — use mock for tests')
    },
  }
}

export interface MockAnalyticsOverrides {
  getVideoMetrics?: (videoId: string) => Promise<AnalyticsMetrics>
  getRetentionCurve?: (videoId: string) => Promise<number[]>
}

export function createMockYouTubeAnalyticsClient(overrides?: MockAnalyticsOverrides): YouTubeAnalyticsClient {
  return {
    getVideoMetrics: overrides?.getVideoMetrics ?? (async () => ({
      views: 500, likes: 30, comments: 5,
      retention: 40, ctr: 4.5, avgWatchTime: 20,
    })),
    getRetentionCurve: overrides?.getRetentionCurve ?? (async () => [100, 90, 80, 70, 60, 50]),
  }
}
