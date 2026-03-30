import type { Video, Thumbnail, VideoMetadata } from '../../contracts/index.js'
import type { YouTubeClient } from '../../services/youtube-upload.js'

export interface UploadToYouTubeParams {
  video: Video
  thumbnail: Thumbnail
  metadata: VideoMetadata
  youtube: YouTubeClient
}

export interface UploadResult {
  videoId: string
  metadata: VideoMetadata
}

export async function uploadToYouTube(params: UploadToYouTubeParams): Promise<UploadResult> {
  const { video, thumbnail, metadata, youtube } = params

  const { videoId } = await youtube.uploadVideo(video.path, metadata)
  await youtube.setThumbnail(videoId, thumbnail.localPath)

  return { videoId, metadata }
}
