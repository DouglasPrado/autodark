import { describe, it, expect } from 'vitest'
import { type YouTubeClient, createMockYouTubeClient } from './youtube-upload.js'

describe('YouTubeClient interface', () => {
  it('mock client uploads and returns video id', async () => {
    const client = createMockYouTubeClient({
      uploadVideo: async () => ({ videoId: 'yt-abc123' }),
    })
    const result = await client.uploadVideo('/tmp/video.mp4', { title: 'Test', description: 'Desc', tags: [] })
    expect(result.videoId).toBe('yt-abc123')
  })

  it('mock client sets thumbnail', async () => {
    const client = createMockYouTubeClient({
      setThumbnail: async () => {},
    })
    await expect(client.setThumbnail('yt-abc', '/tmp/thumb.png')).resolves.toBeUndefined()
  })

  it('mock client uses defaults', async () => {
    const client = createMockYouTubeClient()
    const result = await client.uploadVideo('/tmp/v.mp4', { title: 'T', description: 'D', tags: [] })
    expect(result.videoId).toBeDefined()
  })
})
