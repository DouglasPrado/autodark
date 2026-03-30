import type { Scene } from '../../contracts/index.js'

function extractKeywords(text: string): string {
  const stopWords = new Set([
    'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'sob',
    'que', 'e', 'ou', 'mas', 'se', 'como', 'mais', 'muito', 'também',
    'não', 'já', 'é', 'foi', 'ser', 'ter', 'há', 'são', 'tem', 'isso',
    'este', 'esta', 'esse', 'essa', 'ele', 'ela', 'eles', 'elas',
    'seu', 'sua', 'seus', 'suas', 'nos', 'lá', 'aqui', 'ali',
    'até', 'ao', 'aos', 'à', 'às', 'pelo', 'pela', 'pelos', 'pelas',
    'ainda', 'onde', 'quando', 'porque', 'nunca', 'sempre', 'entre',
  ])

  const words = text
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))

  // Take up to 5 most relevant words
  const unique = [...new Set(words)]
  return unique.slice(0, 5).join(' ')
}

export function generateVisualQueries(scenes: Scene[]): Scene[] {
  return scenes.map((scene) => {
    if (scene.visualQuery && scene.visualQuery.trim().length > 0) {
      return scene
    }

    const query = extractKeywords(scene.text)

    return {
      ...scene,
      visualQuery: query || scene.text.slice(0, 50),
    }
  })
}
