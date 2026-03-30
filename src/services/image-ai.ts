export interface ImageAIResult {
  imageUrl: string
}

export interface ImageAIClient {
  generateImage(prompt: string): Promise<ImageAIResult>
}

export interface ImageAIClientConfig {
  apiKey: string
  provider?: string
}

export function createImageAIClient(config: ImageAIClientConfig): ImageAIClient {
  return {
    async generateImage(prompt: string): Promise<ImageAIResult> {
      const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, n: 1, size: '1280x720' }),
      })

      if (!response.ok) {
        throw new Error(`ImageAI error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as any
      return { imageUrl: data.data[0].url }
    },
  }
}

export interface MockImageAIOverrides {
  generateImage?: (prompt: string) => Promise<ImageAIResult>
}

export function createMockImageAIClient(overrides?: MockImageAIOverrides): ImageAIClient {
  return {
    generateImage: overrides?.generateImage ?? (async () => ({
      imageUrl: 'https://mock.ai/thumbnail.png',
    })),
  }
}
