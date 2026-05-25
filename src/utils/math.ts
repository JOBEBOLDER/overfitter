import type { Point, Difficulty } from '../types'
import { DIFFICULTY_CONFIG } from '../types'

export function generateDataset(difficulty: Difficulty): {
  points: Point[]
  targetSlope: number
  targetIntercept: number
} {
  const config = DIFFICULTY_CONFIG[difficulty]
  const targetSlope = parseFloat((Math.random() * 2.4 - 1.2).toFixed(2))
  const targetIntercept = Math.random() * 40 + 30

  const points: Point[] = []
  for (let i = 0; i < 32; i++) {
    const x = Math.random() * 80 + 10
    let noise = (Math.random() - 0.5) * 2 * config.noise
    if (Math.random() < config.outlierChance) {
      noise += (Math.random() > 0.5 ? 1 : -1) * config.noise * 2.5
    }
    const y = targetSlope * x + targetIntercept + noise
    points.push({ x, y: Math.max(2, Math.min(98, y)) })
  }
  return { points, targetSlope, targetIntercept }
}

export function computeOLS(points: Point[]): { slope: number; intercept: number } {
  const n = points.length
  const meanX = points.reduce((s, p) => s + p.x, 0) / n
  const meanY = points.reduce((s, p) => s + p.y, 0) / n
  const num = points.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0)
  const den = points.reduce((s, p) => s + (p.x - meanX) ** 2, 0)
  const slope = den === 0 ? 0 : num / den
  const intercept = meanY - slope * meanX
  return { slope: parseFloat(slope.toFixed(3)), intercept: parseFloat(intercept.toFixed(3)) }
}

export function computeMetrics(
  points: Point[],
  slope: number,
  intercept: number
): { mse: number; mae: number; r2: number } {
  const predicted = points.map((p) => slope * p.x + intercept)
  const mse = points.reduce((s, p, i) => s + (p.y - predicted[i]) ** 2, 0) / points.length
  const mae = points.reduce((s, p, i) => s + Math.abs(p.y - predicted[i]), 0) / points.length
  const meanY = points.reduce((s, p) => s + p.y, 0) / points.length
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0)
  const ssRes = points.reduce((s, p, i) => s + (p.y - predicted[i]) ** 2, 0)
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot
  return {
    mse: parseFloat(mse.toFixed(2)),
    mae: parseFloat(mae.toFixed(2)),
    r2: parseFloat(r2.toFixed(3)),
  }
}

export function computeScore(
  points: Point[],
  guessSlope: number,
  guessIntercept: number,
  targetSlope: number,
  targetIntercept: number
): number {
  const { mse } = computeMetrics(points, guessSlope, guessIntercept)
  const slopeDiff = Math.abs(guessSlope - targetSlope)
  const intDiff = Math.abs(guessIntercept - targetIntercept)
  const raw = 1000 - mse * 2 - slopeDiff * 150 - intDiff * 4
  return Math.round(Math.max(-2500, raw))
}

export function getFeedback(
  guessSlope: number,
  guessIntercept: number,
  targetSlope: number,
  targetIntercept: number,
  r2: number
): { text: string; tone: 'good' | 'ok' | 'bad' } {
  const sd = guessSlope - targetSlope
  const id = guessIntercept - targetIntercept

  if (Math.abs(sd) < 0.08 && Math.abs(id) < 4) {
    return { text: `Near-perfect fit. R² = ${r2.toFixed(2)}. Your intuition is terrifyingly accurate.`, tone: 'good' }
  }
  if (Math.abs(sd) > 0.6) {
    const dir = sd > 0 ? 'too steep (positive)' : 'too steep (negative)'
    return { text: `Slope is ${dir}. The data is less dramatic than your guess — try flattening it.`, tone: 'bad' }
  }
  if (Math.abs(id) > 12) {
    const dir = id > 0 ? 'too high' : 'too low'
    return { text: `Slope is close, but your line sits ${dir}. Adjust the intercept.`, tone: 'ok' }
  }
  if (r2 < 0) {
    return { text: `R² is negative — your line is worse than a flat mean line. Classic overfit.`, tone: 'bad' }
  }
  return {
    text: `Close! R² = ${r2.toFixed(2)}. Fine-tune the ${Math.abs(sd) > Math.abs(id / 20) ? 'slope' : 'intercept'} a little more.`,
    tone: 'ok',
  }
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
