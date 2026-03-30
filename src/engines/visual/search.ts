import { v4 as uuid } from 'uuid'
import type { Scene, Clip } from '../../contracts/index.js'
import { ClipSource } from '../../contracts/index.js'
import type { PexelsClient, PexelsVideo } from '../../services/pexels.js'

function scoreClip(video: PexelsVideo, sceneDuration: number): number {
  const durationDiff = Math.abs(video.duration - sceneDuration)
  const score = Math.max(0, 100 - durationDiff * 10)
  return Math.round(score * 100) / 100
}

export async function searchClipsForScene(
  scene: Scene,
  pexels: PexelsClient,
  storagePath: string,
): Promise<Clip[]> {
  const videos = await pexels.searchVideos(scene.visualQuery, 5)

  if (videos.length === 0) return []

  const clips: Clip[] = videos.map((video) => ({
    id: uuid(),
    sceneId: scene.id,
    query: scene.visualQuery,
    source: ClipSource.PEXELS,
    mediaId: video.id,
    mediaUrl: video.url,
    localPath: `${storagePath}/clips/${scene.id}/${video.id}.mp4`,
    duration: video.duration,
    score: scoreClip(video, scene.duration),
    createdAt: new Date(),
  }))

  return clips.sort((a, b) => b.score - a.score)
}
