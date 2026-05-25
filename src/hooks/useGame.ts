import { useState, useCallback } from 'react'
import type { Point, RoundResult, GamePhase, Difficulty } from '../types'
import {
  generateDataset,
  computeOLS,
  computeMetrics,
  computeScore,
  getFeedback,
  getWhatHappened,
} from '../utils/math'

interface GameState {
  phase: GamePhase
  round: number
  totalScore: number
  points: Point[]
  targetSlope: number
  targetIntercept: number
  olsSlope: number
  olsIntercept: number
  guessSlope: number
  guessIntercept: number
  difficulty: Difficulty
  history: RoundResult[]
}

function initRound(difficulty: Difficulty, round = 1): Omit<GameState, 'totalScore' | 'history'> {
  const { points, targetSlope, targetIntercept } = generateDataset(difficulty)
  const ols = computeOLS(points)
  return {
    phase: 'guessing',
    round,
    points,
    targetSlope,
    targetIntercept,
    olsSlope: ols.slope,
    olsIntercept: ols.intercept,
    guessSlope: 0,
    guessIntercept: 50,
    difficulty,
  }
}

export function useGame(initialDifficulty: Difficulty = 'medium') {
  const [state, setState] = useState<GameState>(() => ({
    ...initRound(initialDifficulty),
    totalScore: 0,
    history: [],
  }))

  const setGuessSlope = useCallback((v: number) => {
    setState((s) => ({ ...s, guessSlope: v }))
  }, [])

  const setGuessIntercept = useCallback((v: number) => {
    setState((s) => ({ ...s, guessIntercept: v }))
  }, [])

  const submit = useCallback(() => {
    setState((s) => {
      if (s.phase !== 'guessing') return s
      const { mse, r2 } = computeMetrics(s.points, s.guessSlope, s.guessIntercept)
      const score = computeScore(
        s.points,
        s.guessSlope,
        s.guessIntercept,
        s.targetSlope,
        s.targetIntercept
      )
      const result: RoundResult = {
        round: s.round,
        guessSlope: s.guessSlope,
        guessIntercept: s.guessIntercept,
        targetSlope: s.targetSlope,
        targetIntercept: s.targetIntercept,
        mse,
        r2,
        score,
      }
      return {
        ...s,
        phase: 'submitted',
        totalScore: s.totalScore + score,
        history: [...s.history, result],
      }
    })
  }, [])

  const nextRound = useCallback(() => {
    setState((s) => ({
      ...initRound(s.difficulty, s.round + 1),
      totalScore: s.totalScore,
      history: s.history,
    }))
  }, [])

  const setDifficulty = useCallback((d: Difficulty) => {
    setState((s) => ({
      ...initRound(d),
      totalScore: s.totalScore,
      history: s.history,
    }))
  }, [])

  const resetGame = useCallback(() => {
    setState((s) => ({
      ...initRound(s.difficulty),
      totalScore: 0,
      history: [],
    }))
  }, [])

  const metrics =
    state.points.length > 0
      ? computeMetrics(state.points, state.guessSlope, state.guessIntercept)
      : { mse: 0, mae: 0, r2: 0 }

  const feedback =
    state.phase === 'submitted'
      ? getFeedback(
          state.guessSlope,
          state.guessIntercept,
          state.targetSlope,
          state.targetIntercept,
          metrics.r2
        )
      : null

  const lastResult = state.history[state.history.length - 1] ?? null

  const whatHappened =
    state.phase === 'submitted'
      ? getWhatHappened(
          metrics.mse,
          metrics.r2,
          state.guessSlope,
          state.guessIntercept,
          state.targetSlope,
          state.targetIntercept
        )
      : null

  return {
    state,
    metrics,
    feedback,
    whatHappened,
    lastResult,
    setGuessSlope,
    setGuessIntercept,
    submit,
    nextRound,
    setDifficulty,
    resetGame,
  }
}
