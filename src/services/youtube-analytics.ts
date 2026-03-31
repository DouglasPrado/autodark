import { google } from 'googleapis'

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

export function createYouTubeAnalyticsClient(config: YouTubeAnalyticsConfig): YouTubeAnalyticsClient {
  const oauth2 = new google.auth.OAuth2(config.clientId, config.clientSecret)
  oauth2.setCredentials({ refresh_token: config.refreshToken })

  const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2 })
  const youtube = google.youtube({ version: 'v3', auth: oauth2 })

  return {
    async getVideoMetrics(videoId) {
      const [analyticsRes, videoRes] = await Promise.all([
        youtubeAnalytics.reports.query({
          ids: 'channel==MINE',
          startDate: '2020-01-01',
          endDate: new Date().toISOString().split('T')[0],
          metrics: 'views,likes,comments,averageViewDuration',
          filters: `video==${videoId}`,
        }),
        youtube.videos.list({
          part: ['statistics'],
          id: [videoId],
        }),
      ])

      const row = analyticsRes.data.rows?.[0] ?? []
      const stats = videoRes.data.items?.[0]?.statistics

      const views = Number(stats?.viewCount ?? row[0] ?? 0)
      const likes = Number(stats?.likeCount ?? row[1] ?? 0)
      const comments = Number(stats?.commentCount ?? row[2] ?? 0)
      const avgWatchTime = Number(row[3] ?? 0)

      // CTR and retention require YouTube Studio API or estimations
      const ctr = views > 0 ? Math.min((likes / views) * 100, 100) : 0
      const retention = avgWatchTime > 0 ? Math.min((avgWatchTime / 60) * 100, 100) : 0

      return { views, likes, comments, retention, ctr, avgWatchTime }
    },

    async getRetentionCurve(videoId) {
      // YouTube Analytics v2 doesn't expose per-second retention publicly.
      // This uses the audienceRetention metric which gives relative retention at intervals.
      try {
        const response = await youtubeAnalytics.reports.query({
          ids: 'channel==MINE',
          startDate: '2020-01-01',
          endDate: new Date().toISOString().split('T')[0],
          metrics: 'audienceWatchRatio',
          dimensions: 'elapsedVideoTimeRatio',
          filters: `video==${videoId}`,
        })

        const rows = response.data.rows ?? []
        return rows.map((r: any[]) => Math.round(Number(r[1]) * 100))
      } catch {
        // Fallback: return empty if not available
        return []
      }
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
