import { describe, it, expect } from 'vitest'
import { type FFmpegClient, createMockFFmpegClient } from './ffmpeg.js'

describe('FFmpegClient interface', () => {
  it('mock client executes command and returns output path', async () => {
    const client = createMockFFmpegClient({
      execute: async (args) => ({ outputPath: '/tmp/out.mp4', durationMs: 100 }),
    })
    const result = await client.execute(['-i', 'input.mp4', 'output.mp4'])
    expect(result.outputPath).toBe('/tmp/out.mp4')
    expect(result.durationMs).toBe(100)
  })

  it('mock client uses defaults', async () => {
    const client = createMockFFmpegClient()
    const result = await client.execute(['-version'])
    expect(result.outputPath).toBeDefined()
  })
})
