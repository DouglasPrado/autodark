function similarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/))
  const wordsB = new Set(b.toLowerCase().split(/\s+/))
  let common = 0
  for (const w of wordsA) {
    if (wordsB.has(w)) common++
  }
  const union = new Set([...wordsA, ...wordsB]).size
  return union === 0 ? 0 : common / union
}

export function clusterTopics(topics: string[]): string[][] {
  if (topics.length === 0) return []

  const assigned = new Set<number>()
  const clusters: string[][] = []

  for (let i = 0; i < topics.length; i++) {
    if (assigned.has(i)) continue

    const cluster = [topics[i]!]
    assigned.add(i)

    for (let j = i + 1; j < topics.length; j++) {
      if (assigned.has(j)) continue
      if (similarity(topics[i]!, topics[j]!) > 0.2) {
        cluster.push(topics[j]!)
        assigned.add(j)
      }
    }

    clusters.push(cluster)
  }

  return clusters
}
