import { useRef, useEffect, useCallback, useState } from 'react'
import type { Point } from '../types'
import {
  drawGrid,
  drawPoints,
  drawLine,
  drawErrorLines,
  drawLineLegend,
} from '../utils/canvas'
import { lerp } from '../utils/math'

/** Total animation duration — increase to slow down gradient descent */
const GD_DURATION_MS = 3500

interface Props {
  points: Point[]
  guessSlope: number
  guessIntercept: number
  targetSlope: number
  targetIntercept: number
  olsSlope: number
  olsIntercept: number
  phase: 'guessing' | 'submitted' | 'animating'
}

export default function ScatterPlot({
  points,
  guessSlope,
  guessIntercept,
  targetSlope,
  targetIntercept,
  olsSlope,
  olsIntercept,
  phase,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const savedGuessRef = useRef({ slope: guessSlope, intercept: guessIntercept })
  const [isAnimating, setIsAnimating] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [viewSlope, setViewSlope] = useState(guessSlope)
  const [viewIntercept, setViewIntercept] = useState(guessIntercept)

  // Reset animation UI when leaving submitted phase (e.g. next round)
  useEffect(() => {
    if (phase !== 'submitted') {
      cancelAnimationFrame(animRef.current)
      setIsAnimating(false)
      setCanUndo(false)
    }
  }, [phase])

  // Keep canvas line in sync with submitted guess unless animating or showing OLS result
  useEffect(() => {
    if (!isAnimating && !canUndo) {
      setViewSlope(guessSlope)
      setViewIntercept(guessIntercept)
    }
  }, [guessSlope, guessIntercept, isAnimating, canUndo])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width / devicePixelRatio
    const h = canvas.height / devicePixelRatio
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawGrid(ctx, w, h)
    if (phase === 'submitted') {
      drawErrorLines(ctx, points, viewSlope, viewIntercept, w, h)
    }
    drawPoints(ctx, points, w, h)
    drawLine(ctx, viewSlope, viewIntercept, w, h, '#378ADD', 2.5)
    if (phase === 'submitted') {
      drawLine(ctx, olsSlope, olsIntercept, w, h, '#639922', 2, [7, 5])
    }
    drawLineLegend(ctx, w, h, phase === 'submitted')
  }, [points, viewSlope, viewIntercept, olsSlope, olsIntercept, phase])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = devicePixelRatio
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
      draw()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    return () => ro.disconnect()
  }, [draw])

  useEffect(() => {
    draw()
  }, [draw])

  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

  const undoGradientDescent = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    setIsAnimating(false)
    setViewSlope(savedGuessRef.current.slope)
    setViewIntercept(savedGuessRef.current.intercept)
    setCanUndo(false)
  }, [])

  const runGradientDescent = useCallback(() => {
    if (isAnimating) return
    savedGuessRef.current = { slope: guessSlope, intercept: guessIntercept }
    setCanUndo(false)
    setIsAnimating(true)
    cancelAnimationFrame(animRef.current)

    const targetS = olsSlope
    const targetB = olsIntercept
    const startS = guessSlope
    const startB = guessIntercept
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / GD_DURATION_MS)
      const eased = easeInOut(t)
      const s = lerp(startS, targetS, eased)
      const b = lerp(startB, targetB, eased)
      setViewSlope(s)
      setViewIntercept(b)
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setViewSlope(targetS)
        setViewIntercept(targetB)
        setIsAnimating(false)
        setCanUndo(true)
      }
    }
    animRef.current = requestAnimationFrame(animate)
  }, [guessSlope, guessIntercept, olsSlope, olsIntercept, isAnimating])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', borderRadius: 14 }}
        aria-label="Scatter plot with regression line"
        role="img"
      />
      {phase === 'submitted' && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            gap: 8,
          }}
        >
          {canUndo && (
            <button
              onClick={undoGradientDescent}
              disabled={isAnimating}
              style={{
                padding: '8px 16px',
                background: '#fff',
                color: 'var(--text-secondary)',
                border: '0.5px solid var(--border-strong)',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                cursor: isAnimating ? 'default' : 'pointer',
                letterSpacing: '0.3px',
              }}
            >
              ↩ Undo
            </button>
          )}
          <button
            onClick={runGradientDescent}
            disabled={isAnimating}
            style={{
              padding: '8px 16px',
              background: isAnimating ? '#ccc' : '#1a1916',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              cursor: isAnimating ? 'default' : 'pointer',
              transition: 'background 0.2s',
              letterSpacing: '0.3px',
            }}
          >
            {isAnimating ? 'Descending...' : '▶ Gradient Descent'}
          </button>
        </div>
      )}
    </div>
  )
}
