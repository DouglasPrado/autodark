import type { Scene, AudioSegment, Clip } from '../../contracts/index.js'
import type { FFmpegClient } from '../../services/ffmpeg.js'

export interface ComposeSceneParams {
  scene: Scene
  audio: AudioSegment
  clip: Clip
  ffmpeg: FFmpegClient
  outputDir: string
}

export async function composeScene(params: ComposeSceneParams): Promise<string> {
  const { scene, audio, clip, ffmpeg, outputDir } = params
  const outputPath = `${outputDir}/scene-${scene.id}.mp4`

  await ffmpeg.execute([
    '-i', clip.localPath,
    '-i', audio.audioUrl,
    '-t', String(scene.duration),
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-shortest',
    '-y',
    outputPath,
  ])

  return outputPath
}
