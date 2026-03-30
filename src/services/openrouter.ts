export interface LLMClient {
  generate(prompt: string): Promise<string>
  generateStructured<T = unknown>(prompt: string, schema: unknown): Promise<T>
}

export interface LLMClientConfig {
  apiKey: string
  baseUrl?: string
  model?: string
}

export function createOpenRouterClient(config: LLMClientConfig): LLMClient {
  const baseUrl = config.baseUrl ?? 'https://openrouter.ai/api/v1'
  const model = config.model ?? 'anthropic/claude-3-haiku'

  return {
    async generate(prompt: string): Promise<string> {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as any
      return data.choices[0].message.content
    },

    async generateStructured<T = unknown>(prompt: string, _schema: unknown): Promise<T> {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt + '\n\nResponda APENAS em JSON válido.' }],
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json() as any
      return JSON.parse(data.choices[0].message.content) as T
    },
  }
}

export interface MockLLMOverrides {
  generate?: (prompt: string) => Promise<string>
  generateStructured?: (prompt: string, schema?: unknown) => Promise<any>
}

export function createMockLLMClient(overrides?: MockLLMOverrides): LLMClient {
  return {
    generate: overrides?.generate ?? (async () => 'mock response'),
    generateStructured: overrides?.generateStructured ?? (async () => ({})),
  }
}
