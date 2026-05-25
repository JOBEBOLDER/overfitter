export interface Point {
  x: number
  y: number
}

export interface RoundResult {
  round: number
  guessSlope: number
  guessIntercept: number
  targetSlope: number
  targetIntercept: number
  mse: number
  r2: number
  score: number
}

export type GamePhase = 'guessing' | 'submitted' | 'animating'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  noise: number
  outlierChance: number
  label: string
  description: string
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { noise: 8, outlierChance: 0, label: 'Easy', description: 'Low noise, clear pattern' },
  medium: { noise: 16, outlierChance: 0.1, label: 'Medium', description: 'Some noise and outliers' },
  hard: { noise: 28, outlierChance: 0.25, label: 'Hard', description: 'High noise, tricky pattern' },
}
