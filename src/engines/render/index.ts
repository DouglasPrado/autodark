import { v4 as uuid } from 'uuid'
import type { Scene, AudioSegment, Clip, Video } from '../../contracts/index.js'
import type { FFmpegClient } from '../../services/ffmpeg.js'
import { VIDEO_RESOLUTION, VIDEO_FORMAT } from '../../utils/constants.js'
import { composeScene } from './compose.js'
import { stitchScenes } from './stitch.js'
import { addSubtitles } from './subtitles.js'
import { addBackgroundMusic } from './music.js'

export interface RenderEngineConfig {
  ffmpeg: FFmpegClient
  outputDir: string
  pipelineId: string
}

export interface RenderEngine {
  renderFull(scenes: Scene[], audios: AudioSegment[], clips: Clip[]): Promise<Video>
}

export function createRenderEngine(config: RenderEngineConfig): RenderEngine {
  const { ffmpeg, outputDir, pipelineId } = config

  return {
    async renderFull(scenes, audios, clips): Promise<Video> {
      const audioMap = new Map(audios.map((a) => [a.sceneId, a]))
      const clipMap = new Map(clips.map((c) => [c.sceneId, c]))

      // 1. Compose each scene
      const scenePaths: string[] = []
      for (const scene of scenes) {
        const audio = audioMap.get(scene.id)
        const clip = clipMap.get(scene.id)
        if (!audio || !clip) continue

        const path = await composeScene({ scene, audio, clip, ffmpeg, outputDir })
        scenePaths.push(path)
      }

      // 2. Stitch all scenes
      const stitchedPath = await stitchScenes({ scenePaths, ffmpeg, outputDir })

      // 3. Add subtitles
      const subtitledPath = await addSubtitles({
        videoPath: stitchedPath,
        scenes,
        ffmpeg,
        outputDir,
      })

      // 4. Add background music
      const finalPath = await addBackgroundMusic({
        videoPath: subtitledPath,
        ffmpeg,
        outputDir,
      })

      const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0)

      return {
        id: uuid(),
        pipelineId,
        path: finalPath,
        duration: totalDuration,
        resolution: VIDEO_RESOLUTION,
        format: VIDEO_FORMAT,
        size: 0,
        hasSubtitles: true,
        hasMusic: true,
        createdAt: new Date(),
      }
    },
  }
}

export { composeScene } from './compose.js'
export { stitchScenes } from './stitch.js'
export { generateSubtitles, addSubtitles } from './subtitles.js'
export { addBackgroundMusic } from './music.js'
