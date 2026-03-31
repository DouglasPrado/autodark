import { google } from 'googleapis'
import { createReadStream } from 'fs'
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

export function createYouTubeClient(config: YouTubeClientConfig): YouTubeClient {
  const oauth2 = new google.auth.OAuth2(config.clientId, config.clientSecret)
  oauth2.setCredentials({ refresh_token: config.refreshToken })

  const youtube = google.youtube({ version: 'v3', auth: oauth2 })

  return {
    async uploadVideo(videoPath, metadata) {
      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: '22', // People & Blogs
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: createReadStream(videoPath),
        },
      })

      const videoId = response.data.id
      if (!videoId) throw new Error('YouTube upload retornou sem videoId')

      return { videoId }
    },

    async setThumbnail(videoId, thumbnailPath) {
      await youtube.thumbnails.set({
        videoId,
        media: {
          body: createReadStream(thumbnailPath),
        },
      })
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
