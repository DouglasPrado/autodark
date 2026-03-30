import type { Idea, Script, Video, Thumbnail, VideoMetadata } from '../../contracts/index.js'
import type { LLMClient } from '../../services/openrouter.js'
import type { YouTubeClient } from '../../services/youtube-upload.js'
import { generateMetadata } from './metadata.js'
import { uploadToYouTube, type UploadResult } from './youtube.js'

export interface UploadEngineConfig {
  llm: LLMClient
  youtube: YouTubeClient
}

export interface UploadParams {
  idea: Idea
  script: Script
  video: Video
  thumbnail: Thumbnail
}

export interface UploadEngine {
  upload(params: UploadParams): Promise<UploadResult>
}

export function createUploadEngine(config: UploadEngineConfig): UploadEngine {
  const { llm, youtube } = config

  return {
    async upload(params) {
      const metadata = await generateMetadata({
        idea: params.idea,
        script: params.script,
        llm,
      })

      return uploadToYouTube({
        video: params.video,
        thumbnail: params.thumbnail,
        metadata,
        youtube,
      })
    },
  }
}

export { generateMetadata } from './metadata.js'
export { uploadToYouTube } from './youtube.js'
