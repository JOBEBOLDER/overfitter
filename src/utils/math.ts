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
    return {
      text: `Near-perfect fit (R² = ${r2.toFixed(2)}). You're tracking the signal, not just memorizing noise.`,
      tone: 'good',
    }
  }
  if (Math.abs(sd) > 0.6) {
    const dir = sd > 0 ? 'too steep (positive)' : 'too steep (negative)'
    return {
      text: `Slope is ${dir} — often a sign you're fitting the noise, not the signal. Try flattening the line.`,
      tone: 'bad',
    }
  }
  if (Math.abs(id) > 12) {
    const dir = id > 0 ? 'too high' : 'too low'
    return {
      text: `Slope is close, but the intercept sits ${dir}. Shift the line vertically without chasing outliers.`,
      tone: 'ok',
    }
  }
  if (r2 < 0) {
    return {
      text: `R² is negative — your line fits worse than a flat mean. That's the textbook overfit pattern.`,
      tone: 'bad',
    }
  }
  return {
    text: `Close (R² = ${r2.toFixed(2)}). Nudge the ${Math.abs(sd) > Math.abs(id / 20) ? 'slope' : 'intercept'} — small moves beat chasing every point.`,
    tone: 'ok',
  }
}

/** One or two sentences after submit — only when it adds meaning */
export function getWhatHappened(
  mse: number,
  r2: number,
  guessSlope: number,
  guessIntercept: number,
  targetSlope: number,
  targetIntercept: number
): string {
  const slopeDelta = Math.abs(guessSlope - targetSlope)
  const intDelta = Math.abs(guessIntercept - targetIntercept)

  if (r2 < 0) {
    return `Your R² was negative. That means your line explained less variance than a flat mean line — the classic sign of overfitting to noise.`
  }
  if (r2 >= 0.85 && slopeDelta < 0.15 && intDelta < 6) {
    return `Your R² was ${r2.toFixed(2)} — most of the spread is explained by your line. You captured the underlying trend, not random wiggles.`
  }
  if (mse > 400) {
    return `MSE was ${mse.toFixed(0)} — on average, points sat far from your line (squared errors add up fast). Large gaps usually mean slope or intercept is off.`
  }
  if (slopeDelta > 0.5) {
    return `Slope Δ was ${(guessSlope - targetSlope).toFixed(2)}. A big slope miss often means the line is tilted to hug outliers instead of the true trend.`
  }
  if (intDelta > 10) {
    return `Intercept Δ was ${(guessIntercept - targetIntercept).toFixed(1)}. Your tilt may be fine, but the line is shifted up or down — vertical offset, not slope drama.`
  }
  if (r2 >= 0.5 && r2 < 0.85) {
    return `R² was ${r2.toFixed(2)} — decent, but plenty of variance is still unexplained. You're in the ballpark; fine-tuning beats over-chasing points.`
  }
  return `R² was ${r2.toFixed(2)} and MSE was ${mse.toFixed(0)}. R² tells you how much variance your line explains; MSE tells you how far points sit on average (squared).`
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
