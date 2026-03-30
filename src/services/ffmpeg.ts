import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export interface FFmpegResult {
  outputPath: string
  durationMs: number
}

export interface FFmpegClient {
  execute(args: string[]): Promise<FFmpegResult>
}

export function createFFmpegClient(): FFmpegClient {
  return {
    async execute(args: string[]): Promise<FFmpegResult> {
      const start = performance.now()
      const outputPath = args[args.length - 1] ?? ''
      await execFileAsync('ffmpeg', args)
      const durationMs = Math.round(performance.now() - start)
      return { outputPath, durationMs }
    },
  }
}

export interface MockFFmpegOverrides {
  execute?: (args: string[]) => Promise<FFmpegResult>
}

export function createMockFFmpegClient(overrides?: MockFFmpegOverrides): FFmpegClient {
  return {
    execute: overrides?.execute ?? (async (args) => ({
      outputPath: args[args.length - 1] ?? '/tmp/mock-output.mp4',
      durationMs: 50,
    })),
  }
}
