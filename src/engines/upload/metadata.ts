import type { Idea, Script, VideoMetadata } from '../../contracts/index.js'
import type { LLMClient } from '../../services/openrouter.js'

interface MetadataResponse {
  title: string
  description: string
  tags: string[]
}

export interface GenerateMetadataParams {
  idea: Idea
  script: Script
  llm: LLMClient
}

export async function generateMetadata(params: GenerateMetadataParams): Promise<VideoMetadata> {
  const { idea, script, llm } = params

  const prompt = `Gere metadados para um vídeo YouTube.
Tema: "${idea.text}"
Nicho: ${idea.niche}
Hook: "${script.hook}"

Gere:
- title: Título otimizado para CTR (máx 100 caracteres), com emojis e CAPS estratégicos
- description: Descrição de 2-3 frases com keywords
- tags: Array de 5-10 tags relevantes para SEO

Retorne JSON com campos: title, description, tags`

  const response = await llm.generateStructured<MetadataResponse>(prompt, {})

  return {
    title: response.title,
    description: response.description,
    tags: response.tags,
  }
}
