import { writeFile, mkdir } from 'fs/promises'
import { dirname } from 'path'

export interface FileStorage {
  download(url: string, destPath: string): Promise<string>
  ensureDir(dirPath: string): Promise<void>
  writeBuffer(destPath: string, data: Buffer): Promise<string>
}

export function createFileStorage(): FileStorage {
  return {
    async download(url: string, destPath: string): Promise<string> {
      await this.ensureDir(dirname(destPath))
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${url}`)
      }
      const buffer = Buffer.from(await response.arrayBuffer())
      await writeFile(destPath, buffer)
      return destPath
    },

    async ensureDir(dirPath: string): Promise<void> {
      await mkdir(dirPath, { recursive: true })
    },

    async writeBuffer(destPath: string, data: Buffer): Promise<string> {
      await this.ensureDir(dirname(destPath))
      await writeFile(destPath, data)
      return destPath
    },
  }
}
