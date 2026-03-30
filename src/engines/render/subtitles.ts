import type { Scene } from '../../contracts/index.js'
import type { FFmpegClient } from '../../services/ffmpeg.js'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

export function generateSubtitles(scenes: Scene[]): string {
  return scenes
    .map((scene, index) => {
      const start = formatTime(scene.start)
      const end = formatTime(scene.end)
      return `${index + 1}\n${start} --> ${end}\n${scene.text}\n`
    })
    .join('\n')
}

export interface AddSubtitlesParams {
  videoPath: string
  scenes: Scene[]
  ffmpeg: FFmpegClient
  outputDir: string
}

export async function addSubtitles(params: AddSubtitlesParams): Promise<string> {
  const { videoPath, scenes, ffmpeg, outputDir } = params
  const outputPath = `${outputDir}/subtitled.mp4`

  // In production: write SRT to file, then embed with FFmpeg
  const _srt = generateSubtitles(scenes)

  await ffmpeg.execute([
    '-i', videoPath,
    '-vf', 'subtitles=subs.srt',
    '-c:a', 'copy',
    '-y',
    outputPath,
  ])

  return outputPath
}
