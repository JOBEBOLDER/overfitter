import type { RoundResult } from '../types'

interface Props {
  history: RoundResult[]
}

export default function ScoreHistory({ history }: Props) {
  if (history.length === 0) return null

  const maxAbs = Math.max(...history.map((r) => Math.abs(r.score)), 500)

  return (
    <div className="control-panel__card">
      <div className="score-history__label">Round History</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
        {history.map((r) => {
          const pct = Math.abs(r.score) / maxAbs
          const isPos = r.score >= 0
          return (
            <div
              key={r.round}
              title={`Round ${r.round}: ${r.score > 0 ? '+' : ''}${r.score}`}
              style={{
                flex: 1,
                height: `${Math.max(8, pct * 100)}%`,
                background: isPos ? '#639922' : '#993C1D',
                borderRadius: 4,
                opacity: 0.8,
                cursor: 'default',
                transition: 'opacity 0.2s',
              }}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {history.map((r) => (
          <div
            key={r.round}
            className="score-history__round-score"
            style={{
              color: r.score >= 0 ? '#3B6D11' : '#993C1D',
            }}
          >
            {r.score >= 0 ? '+' : ''}{r.score}
          </div>
        ))}
      </div>
    </div>
  )
}
