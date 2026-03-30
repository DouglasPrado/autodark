import { describe, it, expect } from 'vitest'
import { generateMetadata } from './metadata.js'
import { createUploadEngine } from './index.js'
import { createMockLLMClient } from '../../services/openrouter.js'
import { createMockYouTubeClient } from '../../services/youtube-upload.js'
import type { Idea, Script, Video, Thumbnail } from '../../contracts/index.js'

const mockIdea: Idea = {
  id: 'idea-1', niche: 'dark',
  text: 'Os 5 lugares mais assombrados do mundo',
  source: 'strategy', createdAt: new Date(),
}

const mockScript: Script = {
  id: 'script-1', ideaId: 'idea-1',
  template: 'HOOK→SETUP→ESCALADA→TWIST→PAYOFF→LOOP',
  hook: 'Você não vai acreditar...',
  setup: 'Em 1947 um grupo...',
  escalada: 'O que encontraram mudou tudo...',
  estimatedDuration: 45, createdAt: new Date(),
}

const mockVideo: Video = {
  id: 'vid-1', pipelineId: 'pipe-1', path: '/tmp/final.mp4',
  duration: 45, resolution: '1920x1080', format: 'mp4',
  size: 50000000, hasSubtitles: true, hasMusic: true, createdAt: new Date(),
}

const mockThumbnail: Thumbnail = {
  id: 'thumb-1', videoId: 'vid-1', concepts: ['dark forest'],
  imageUrl: 'https://img.png', localPath: '/tmp/thumb.png',
  ctrScore: 85, isSelected: true, createdAt: new Date(),
}

describe('generateMetadata', () => {
  it('generates title, description and tags via LLM', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => ({
        title: 'Os 5 Lugares Mais ASSOMBRADOS do Mundo 😱',
        description: 'Descubra os lugares mais assustadores...',
        tags: ['dark', 'assombrado', 'mistério', 'terror'],
      }),
    })
    const metadata = await generateMetadata({ idea: mockIdea, script: mockScript, llm })
    expect(metadata.title).toContain('ASSOMBRADOS')
    expect(metadata.description.length).toBeGreaterThan(10)
    expect(metadata.tags.length).toBeGreaterThanOrEqual(3)
  })

  it('includes niche-related tags', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => ({
        title: 'Título',
        description: 'Descrição',
        tags: ['dark', 'mistério'],
      }),
    })
    const metadata = await generateMetadata({ idea: mockIdea, script: mockScript, llm })
    expect(metadata.tags).toBeDefined()
  })
})

describe('UploadEngine (facade)', () => {
  it('uploads video with metadata and thumbnail, returns videoId', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => ({
        title: 'Título gerado',
        description: 'Descrição gerada',
        tags: ['tag1', 'tag2'],
      }),
    })
    const youtube = createMockYouTubeClient({
      uploadVideo: async () => ({ videoId: 'yt-xyz789' }),
      setThumbnail: async () => {},
    })

    const engine = createUploadEngine({ llm, youtube })
    const result = await engine.upload({
      idea: mockIdea,
      script: mockScript,
      video: mockVideo,
      thumbnail: mockThumbnail,
    })

    expect(result.videoId).toBe('yt-xyz789')
    expect(result.metadata.title).toBe('Título gerado')
  })

  it('calls setThumbnail after upload', async () => {
    let thumbnailSet = false
    const llm = createMockLLMClient({
      generateStructured: async () => ({ title: 'T', description: 'D', tags: [] }),
    })
    const youtube = createMockYouTubeClient({
      uploadVideo: async () => ({ videoId: 'yt-123' }),
      setThumbnail: async () => { thumbnailSet = true },
    })

    const engine = createUploadEngine({ llm, youtube })
    await engine.upload({
      idea: mockIdea, script: mockScript,
      video: mockVideo, thumbnail: mockThumbnail,
    })

    expect(thumbnailSet).toBe(true)
  })
})
