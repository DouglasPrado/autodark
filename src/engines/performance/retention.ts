const DROP_THRESHOLD = 15 // percentage points

export function detectDropOffPoints(curve: number[]): number[] {
  if (curve.length < 2) return []

  const dropOffs: number[] = []

  for (let i = 1; i < curve.length; i++) {
    const drop = (curve[i - 1] ?? 0) - (curve[i] ?? 0)
    if (drop >= DROP_THRESHOLD) {
      dropOffs.push(i)
    }
  }

  return dropOffs
}
