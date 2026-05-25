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
  const [isAnimating, setIsAnimating] = useState(false)
  const [animSlope, setAnimSlope] = useState(guessSlope)
  const [animIntercept, setAnimIntercept] = useState(guessIntercept)

  const draw = useCallback(
    (overrideSlope?: number, overrideIntercept?: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const w = canvas.width / devicePixelRatio
      const h = canvas.height / devicePixelRatio
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const slope = overrideSlope ?? guessSlope
      const intercept = overrideIntercept ?? guessIntercept

      drawGrid(ctx, w, h)
      if (phase === 'submitted') {
        drawErrorLines(ctx, points, slope, intercept, w, h)
      }
      drawPoints(ctx, points, w, h)
      drawLine(ctx, slope, intercept, w, h, '#378ADD', 2.5)
      if (phase === 'submitted') {
        drawLine(ctx, olsSlope, olsIntercept, w, h, '#639922', 2, [7, 5])
      }
      drawLineLegend(ctx, w, h, phase === 'submitted')
    },
    [points, guessSlope, guessIntercept, olsSlope, olsIntercept, phase]
  )

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

  const runGradientDescent = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    cancelAnimationFrame(animRef.current)

    let s = guessSlope
    let b = guessIntercept
    const targetS = olsSlope
    const targetB = olsIntercept
    const STEPS = 80
    let step = 0

    const animate = () => {
      step++
      const t = step / STEPS
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      s = lerp(guessSlope, targetS, eased)
      b = lerp(guessIntercept, targetB, eased)
      setAnimSlope(s)
      setAnimIntercept(b)
      draw(s, b)
      if (step < STEPS) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [guessSlope, guessIntercept, olsSlope, olsIntercept, isAnimating, draw])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', borderRadius: 14 }}
        aria-label="Scatter plot with regression line"
        role="img"
      />
      {phase === 'submitted' && (
        <button
          onClick={runGradientDescent}
          disabled={isAnimating}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
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
      )}
    </div>
  )
}
