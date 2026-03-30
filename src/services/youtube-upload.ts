import type { VideoMetadata } from '../contracts/index.js'

export interface YouTubeUploadResult {
  videoId: string
}

export interface YouTubeClient {
  uploadVideo(videoPath: string, metadata: VideoMetadata): Promise<YouTubeUploadResult>
  setThumbnail(videoId: string, thumbnailPath: string): Promise<void>
}

export interface YouTubeClientConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
}

export function createYouTubeClient(_config: YouTubeClientConfig): YouTubeClient {
  return {
    async uploadVideo(videoPath, metadata) {
      // In production: OAuth2 → YouTube Data API v3 videos.insert
      throw new Error('YouTube upload requires OAuth2 configuration — use mock for tests')
    },
    async setThumbnail(videoId, thumbnailPath) {
      // In production: YouTube Data API v3 thumbnails.set
      throw new Error('YouTube thumbnail requires OAuth2 configuration — use mock for tests')
    },
  }
}

export interface MockYouTubeOverrides {
  uploadVideo?: (videoPath: string, metadata: VideoMetadata) => Promise<YouTubeUploadResult>
  setThumbnail?: (videoId: string, thumbnailPath: string) => Promise<void>
}

export function createMockYouTubeClient(overrides?: MockYouTubeOverrides): YouTubeClient {
  return {
    uploadVideo: overrides?.uploadVideo ?? (async () => ({ videoId: `yt-mock-${Date.now()}` })),
    setThumbnail: overrides?.setThumbnail ?? (async () => {}),
  }
}
