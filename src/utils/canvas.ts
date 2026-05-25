import type { Point } from '../types'

export const PAD = 40

export function toCanvas(
  x: number,
  y: number,
  w: number,
  h: number
): { cx: number; cy: number } {
  return {
    cx: PAD + (x / 100) * (w - 2 * PAD),
    cy: h - PAD - (y / 100) * (h - 2 * PAD),
  }
}

export function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = 'rgba(0,0,0,0.04)'
  ctx.lineWidth = 0.5
  for (let i = 10; i <= 90; i += 20) {
    const { cy } = toCanvas(0, i, w, h)
    const { cx } = toCanvas(i, 0, w, h)
    ctx.beginPath(); ctx.moveTo(PAD, cy); ctx.lineTo(w - PAD, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, PAD); ctx.lineTo(cx, h - PAD); ctx.stroke()
  }
  // axes
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, h - PAD); ctx.lineTo(w - PAD, h - PAD); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(PAD, PAD); ctx.lineTo(PAD, h - PAD); ctx.stroke()
}

export function drawPoints(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  w: number,
  h: number,
  color = '#378ADD'
) {
  points.forEach((p) => {
    const { cx, cy } = toCanvas(p.x, p.y, w, h)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(55,138,221,0.15)'
    ctx.beginPath()
    ctx.arc(cx, cy, 8, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  slope: number,
  intercept: number,
  w: number,
  h: number,
  color: string,
  lineWidth = 2,
  dash: number[] = []
) {
  const x0 = 0, x1 = 100
  const y0 = slope * x0 + intercept
  const y1 = slope * x1 + intercept
  const p0 = toCanvas(x0, y0, w, h)
  const p1 = toCanvas(x1, y1, w, h)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(p0.cx, p0.cy)
  ctx.lineTo(p1.cx, p1.cy)
  ctx.stroke()
  ctx.setLineDash([])
}

export function drawErrorLines(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  slope: number,
  intercept: number,
  w: number,
  h: number
) {
  points.forEach((p) => {
    const predicted = slope * p.x + intercept
    const { cx, cy: cy1 } = toCanvas(p.x, p.y, w, h)
    const { cy: cy2 } = toCanvas(p.x, predicted, w, h)
    ctx.strokeStyle = 'rgba(215,90,50,0.35)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(cx, cy1)
    ctx.lineTo(cx, cy2)
    ctx.stroke()
    ctx.setLineDash([])
  })
}

export function drawLineLegend(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  showTarget: boolean
) {
  const items = [
    { color: '#378ADD', label: 'Your guess', dash: [] as number[] },
    ...(showTarget ? [{ color: '#639922', label: 'Target (OLS)', dash: [6, 4] }] : []),
  ]
  const boxW = showTarget ? 230 : 115
  const bx = w - PAD - boxW - 8
  const by = PAD + 8
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'
  ctx.lineWidth = 0.5
  roundRect(ctx, bx, by, boxW, 28, 6)
  ctx.fill(); ctx.stroke()

  items.forEach((item, i) => {
    const x = bx + 12 + i * 115
    ctx.strokeStyle = item.color
    ctx.lineWidth = 2
    ctx.setLineDash(item.dash)
    ctx.beginPath(); ctx.moveTo(x, by + 14); ctx.lineTo(x + 20, by + 14); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.font = '11px DM Sans, system-ui'
    ctx.fillText(item.label, x + 24, by + 18)
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
