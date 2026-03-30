export interface PexelsVideo {
  id: string
  url: string
  duration: number
}

export interface PexelsClient {
  searchVideos(query: string, perPage: number): Promise<PexelsVideo[]>
}

export interface PexelsClientConfig {
  apiKey: string
}

export function createPexelsClient(config: PexelsClientConfig): PexelsClient {
  return {
    async searchVideos(query: string, perPage: number): Promise<PexelsVideo[]> {
      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
        {
          headers: { Authorization: config.apiKey },
        },
      )

      if (!response.ok) {
        throw new Error(`Pexels error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as any
      return (data.videos ?? []).map((v: any) => ({
        id: String(v.id),
        url: v.video_files?.[0]?.link ?? '',
        duration: v.duration ?? 0,
      }))
    },
  }
}

export interface MockPexelsOverrides {
  searchVideos?: (query: string, perPage: number) => Promise<PexelsVideo[]>
}

export function createMockPexelsClient(overrides?: MockPexelsOverrides): PexelsClient {
  return {
    searchVideos: overrides?.searchVideos ?? (async () => [
      { id: 'mock-1', url: 'https://pexels.com/mock.mp4', duration: 5 },
    ]),
  }
}
