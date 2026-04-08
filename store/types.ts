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
  shotsPerTargetList?: number[]   // per-target overrides; length === numTargets when set
  scores: ShooterScore[]
}

/** Returns shot count for target at index i, honouring per-target list if present. */
export function getShotsForTarget(stage: Stage, i: number): number {
  return stage.shotsPerTargetList?.[i] ?? stage.shotsPerTarget
}

/** Returns total expected shots for the stage. */
export function totalExpectedShots(stage: Stage): number {
  if (stage.shotsPerTargetList && stage.shotsPerTargetList.length === stage.numTargets) {
    return stage.shotsPerTargetList.reduce((a, b) => a + b, 0)
  }
  return stage.numTargets * stage.shotsPerTarget
}

export function computeHitFactor(hits: Hits, time: number): number {
  if (time <= 0) return 0
  const points = hits.A * 5 + hits.C * 3 + hits.D * 1 - hits.NSM * 10
  return Math.max(0, points) / time
}

export function computePoints(hits: Hits): number {
  return hits.A * 5 + hits.C * 3 + hits.D * 1 - hits.NSM * 10
}
