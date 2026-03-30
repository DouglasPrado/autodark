import type { Clip } from '../../contracts/index.js'

export async function downloadMedia(clip: Clip): Promise<Clip> {
  // In production this would download the file from clip.mediaUrl to clip.localPath
  // For now return the clip with localPath set (actual download in infrastructure layer)
  return clip
}
