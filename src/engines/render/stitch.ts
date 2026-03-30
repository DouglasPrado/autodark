import type { FFmpegClient } from '../../services/ffmpeg.js'
import { EngineError } from '../../core/errors.js'

export interface StitchParams {
  scenePaths: string[]
  ffmpeg: FFmpegClient
  outputDir: string
}

export async function stitchScenes(params: StitchParams): Promise<string> {
  const { scenePaths, ffmpeg, outputDir } = params

  if (scenePaths.length === 0) {
    throw new EngineError('STITCH_NO_SCENES', 'Nenhuma cena para concatenar')
  }

  const outputPath = `${outputDir}/stitched.mp4`

  const inputArgs = scenePaths.flatMap((p) => ['-i', p])

  await ffmpeg.execute([
    ...inputArgs,
    '-filter_complex', `concat=n=${scenePaths.length}:v=1:a=1`,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-y',
    outputPath,
  ])

  return outputPath
}
