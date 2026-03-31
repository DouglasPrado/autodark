import { describe, it, expect } from 'vitest'
import { type YouTubeAnalyticsClient, createMockYouTubeAnalyticsClient } from './youtube-analytics.js'

describe('YouTubeAnalyticsClient interface', () => {
  it('mock client returns metrics for video', async () => {
    const client = createMockYouTubeAnalyticsClient({
      getVideoMetrics: async () => ({
        views: 1500, likes: 120, comments: 30,
        retention: 52.3, ctr: 7.1, avgWatchTime: 28.5,
      }),
    })
    const result = await client.getVideoMetrics('yt-abc')
    expect(result.views).toBe(1500)
    expect(result.retention).toBe(52.3)
  })

  it('mock client returns retention curve', async () => {
    const client = createMockYouTubeAnalyticsClient({
      getRetentionCurve: async () => [100, 95, 88, 80, 72, 65, 60, 55],
    })
    const curve = await client.getRetentionCurve('yt-abc')
    expect(curve).toHaveLength(8)
    expect(curve[0]).toBe(100)
  })

  it('mock client uses defaults', async () => {
    const client = createMockYouTubeAnalyticsClient()
    const result = await client.getVideoMetrics('yt-abc')
    expect(result.views).toBeGreaterThanOrEqual(0)
  })
})
