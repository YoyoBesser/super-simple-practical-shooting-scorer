export type Hits = {
  A: number
  C: number
  D: number
  NSM: number
}

export type ShooterScore = {
  id: string
  shooterName: string
  time: number
  hits: Hits
}

export type Stage = {
  id: string
  name: string
  numTargets: number
  shotsPerTarget: number
  scores: ShooterScore[]
}

export function computeHitFactor(hits: Hits, time: number): number {
  if (time <= 0) return 0
  const points = hits.A * 5 + hits.C * 3 + hits.D * 1 - hits.NSM * 10
  return Math.max(0, points) / time
}

export function computePoints(hits: Hits): number {
  return hits.A * 5 + hits.C * 3 + hits.D * 1 - hits.NSM * 10
}
