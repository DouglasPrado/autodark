import type { FFmpegClient } from '../../services/ffmpeg.js'

export interface AddMusicParams {
  videoPath: string
  ffmpeg: FFmpegClient
  outputDir: string
  musicPath?: string
}

export async function addBackgroundMusic(params: AddMusicParams): Promise<string> {
  const { videoPath, ffmpeg, outputDir, musicPath } = params
  const outputPath = `${outputDir}/final.mp4`
  const bgMusic = musicPath ?? 'assets/music/default-bg.mp3'

  await ffmpeg.execute([
    '-i', videoPath,
    '-i', bgMusic,
    '-filter_complex', '[1:a]volume=0.15[bg];[0:a][bg]amix=inputs=2:duration=first[a]',
    '-map', '0:v',
    '-map', '[a]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-y',
    outputPath,
  ])

  return outputPath
}
