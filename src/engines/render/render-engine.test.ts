import { describe, it, expect, vi } from 'vitest'
import { composeScene } from './compose.js'
import { stitchScenes } from './stitch.js'
import { generateSubtitles, addSubtitles } from './subtitles.js'
import { addBackgroundMusic } from './music.js'
import { createRenderEngine } from './index.js'
import { createMockFFmpegClient } from '../../services/ffmpeg.js'
import type { Scene, AudioSegment, Clip } from '../../contracts/index.js'
import { SegmentType, SceneStatus, ClipSource } from '../../contracts/index.js'
import { VIDEO_RESOLUTION, VIDEO_FORMAT } from '../../utils/constants.js'

function makeScene(id: string, order: number, text: string): Scene {
  return {
    id, scriptId: 'script-1', order, text,
    duration: 2, start: order * 2, end: (order + 1) * 2,
    visualQuery: 'query', segmentType: SegmentType.HOOK,
    status: SceneStatus.PENDING, createdAt: new Date(),
  }
}

function makeAudio(sceneId: string): AudioSegment {
  return {
    id: `audio-${sceneId}`, sceneId, text: 'text',
    voiceId: 'v1', audioUrl: `/audio/${sceneId}.mp3`,
    duration: 2, createdAt: new Date(),
  }
}

function makeClip(sceneId: string): Clip {
  return {
    id: `clip-${sceneId}`, sceneId, query: 'query',
    source: ClipSource.PEXELS, mediaId: 'mid',
    mediaUrl: 'https://pexels.com/v.mp4',
    localPath: `/clips/${sceneId}.mp4`,
    score: 80, createdAt: new Date(),
  }
}

describe('composeScene', () => {
  it('composes a scene from audio + clip and returns output path', async () => {
    const ffmpeg = createMockFFmpegClient({
      execute: async () => ({ outputPath: '/tmp/scene-s1.mp4', durationMs: 50 }),
    })
    const result = await composeScene({
      scene: makeScene('s1', 0, 'Hook text'),
      audio: makeAudio('s1'),
      clip: makeClip('s1'),
      ffmpeg,
      outputDir: '/tmp',
    })
    expect(result).toContain('s1')
    expect(result).toContain('.mp4')
  })
})

describe('stitchScenes', () => {
  it('concatenates scene paths into one video', async () => {
    const ffmpeg = createMockFFmpegClient({
      execute: async () => ({ outputPath: '/tmp/stitched.mp4', durationMs: 80 }),
    })
    const result = await stitchScenes({
      scenePaths: ['/tmp/s1.mp4', '/tmp/s2.mp4', '/tmp/s3.mp4'],
      ffmpeg,
      outputDir: '/tmp',
    })
    expect(result).toContain('.mp4')
  })

  it('throws on empty scene paths', async () => {
    const ffmpeg = createMockFFmpegClient()
    await expect(stitchScenes({
      scenePaths: [],
      ffmpeg,
      outputDir: '/tmp',
    })).rejects.toThrow()
  })
})

describe('generateSubtitles', () => {
  it('generates SRT content from scenes', () => {
    const scenes = [
      makeScene('s1', 0, 'Primeira cena do vídeo'),
      makeScene('s2', 1, 'Segunda cena do vídeo'),
    ]
    const srt = generateSubtitles(scenes)
    expect(srt).toContain('1')
    expect(srt).toContain('Primeira cena do vídeo')
    expect(srt).toContain('2')
    expect(srt).toContain('Segunda cena do vídeo')
    expect(srt).toContain('-->')
  })
})

describe('addSubtitles', () => {
  it('embeds subtitles into video', async () => {
    const ffmpeg = createMockFFmpegClient({
      execute: async () => ({ outputPath: '/tmp/subtitled.mp4', durationMs: 30 }),
    })
    const result = await addSubtitles({
      videoPath: '/tmp/video.mp4',
      scenes: [makeScene('s1', 0, 'Text')],
      ffmpeg,
      outputDir: '/tmp',
    })
    expect(result).toContain('.mp4')
  })
})

describe('addBackgroundMusic', () => {
  it('adds background music to video', async () => {
    const ffmpeg = createMockFFmpegClient({
      execute: async () => ({ outputPath: '/tmp/final.mp4', durationMs: 40 }),
    })
    const result = await addBackgroundMusic({
      videoPath: '/tmp/subtitled.mp4',
      ffmpeg,
      outputDir: '/tmp',
    })
    expect(result).toContain('.mp4')
  })
})

describe('RenderEngine (facade)', () => {
  it('renders full pipeline and returns Video entity', async () => {
    let callCount = 0
    const ffmpeg = createMockFFmpegClient({
      execute: async () => {
        callCount++
        return { outputPath: `/tmp/step-${callCount}.mp4`, durationMs: 50 }
      },
    })

    const engine = createRenderEngine({
      ffmpeg,
      outputDir: '/tmp',
      pipelineId: 'pipe-1',
    })

    const scenes = [
      makeScene('s1', 0, 'Cena um'),
      makeScene('s2', 1, 'Cena dois'),
    ]
    const audios = [makeAudio('s1'), makeAudio('s2')]
    const clips = [makeClip('s1'), makeClip('s2')]

    const video = await engine.renderFull(scenes, audios, clips)

    expect(video.id).toBeDefined()
    expect(video.pipelineId).toBe('pipe-1')
    expect(video.path).toContain('.mp4')
    expect(video.resolution).toBe(VIDEO_RESOLUTION)
    expect(video.format).toBe(VIDEO_FORMAT)
    expect(video.duration).toBeGreaterThan(0)
    expect(video.hasSubtitles).toBe(true)
    expect(video.hasMusic).toBe(true)
    expect(video.createdAt).toBeInstanceOf(Date)
  })

  it('matches audio and clips to scenes by sceneId', async () => {
    const execCalls: string[][] = []
    const ffmpeg = createMockFFmpegClient({
      execute: async (args) => {
        execCalls.push(args)
        return { outputPath: `/tmp/out.mp4`, durationMs: 50 }
      },
    })

    const engine = createRenderEngine({ ffmpeg, outputDir: '/tmp', pipelineId: 'p1' })
    const scenes = [makeScene('s1', 0, 'Text')]
    const audios = [makeAudio('s1')]
    const clips = [makeClip('s1')]

    await engine.renderFull(scenes, audios, clips)
    // At least compose(1) + stitch(1) + subtitles(1) + music(1) = 4 calls
    expect(execCalls.length).toBeGreaterThanOrEqual(4)
  })
})
