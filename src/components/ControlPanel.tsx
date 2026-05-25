import type { Difficulty } from '../types'
import { DIFFICULTY_CONFIG } from '../types'
import MetricTooltip from './MetricTooltip'

interface Props {
  guessSlope: number
  guessIntercept: number
  mse: number
  mae: number
  r2: number
  phase: 'guessing' | 'submitted' | 'animating'
  totalScore: number
  lastScore: number | null
  feedback: { text: string; tone: 'good' | 'ok' | 'bad' } | null
  whatHappened: string | null
  targetSlope: number
  targetIntercept: number
  difficulty: Difficulty
  round: number
  onSlopeChange: (v: number) => void
  onInterceptChange: (v: number) => void
  onSubmit: () => void
  onNext: () => void
  onReset: () => void
  onDifficultyChange: (d: Difficulty) => void
}

const toneColors: Record<string, { bg: string; text: string; border: string }> = {
  good: { bg: '#eaf3de', text: '#3B6D11', border: '#c0dd97' },
  ok: { bg: '#faeeda', text: '#854F0B', border: '#fac775' },
  bad: { bg: '#faece7', text: '#993C1D', border: '#f5c4b3' },
}

export default function ControlPanel({
  guessSlope,
  guessIntercept,
  mse,
  mae,
  r2,
  phase,
  totalScore,
  lastScore,
  feedback,
  whatHappened,
  targetSlope,
  targetIntercept,
  difficulty,
  round,
  onSlopeChange,
  onInterceptChange,
  onSubmit,
  onNext,
  onReset,
  onDifficultyChange,
}: Props) {
  const scoreColor =
    totalScore > 0 ? '#3B6D11' : totalScore < 0 ? '#993C1D' : 'var(--text-secondary)'
  const lastScoreColor =
    lastScore !== null ? (lastScore >= 0 ? '#3B6D11' : '#993C1D') : 'var(--text-secondary)'

  const metrics =
    phase === 'submitted'
      ? [
          {
            label: 'MSE',
            value: mse.toFixed(1),
            tip: 'Mean squared error — average squared gap from points to your line. Lower is better.',
          },
          {
            label: 'R²',
            value: r2.toFixed(3),
            tip: '1 = perfect fit, 0 = no better than a flat mean, <0 = worse than a flat line (overfit territory).',
          },
          {
            label: 'Slope Δ',
            value: (guessSlope - targetSlope).toFixed(2),
            tip: 'Your slope minus the hidden true slope. Large values mean you tilted too much or too little.',
          },
          {
            label: 'Intercept Δ',
            value: (guessIntercept - targetIntercept).toFixed(1),
            tip: 'Vertical offset vs the true line — shift up/down without changing tilt.',
          },
        ]
      : [
          {
            label: 'MSE',
            value: mse.toFixed(1),
            tip: 'Mean squared error — how far points sit from your line, on average (squared).',
          },
          {
            label: 'R²',
            value: r2.toFixed(3),
            tip: '1 = perfect fit, 0 = flat mean, <0 = your line is worse than guessing the average y.',
          },
          {
            label: 'MAE',
            value: mae.toFixed(1),
            tip: 'Mean absolute error — typical distance from a point to your line, without squaring.',
          },
          {
            label: 'Points',
            value: '32',
            tip: 'Random points this round. Noise level depends on difficulty.',
          },
        ]

  return (
    <div className="control-panel">
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
          <span className="control-panel__title">Overfitter</span>
          <span className="control-panel__round">Round {round}</span>
        </div>
        <p className="control-panel__subtitle">Welcome. You're probably going to overfit.</p>
      </div>

      <div
        className="control-panel__card"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <div className="control-panel__section-label" style={{ marginBottom: 6 }}>
            Total Score
          </div>
          <div className="control-panel__score-lg" style={{ color: scoreColor }}>
            {totalScore > 0 ? '+' : ''}
            {totalScore.toLocaleString()}
          </div>
        </div>
        {lastScore !== null && (
          <div style={{ textAlign: 'right' }}>
            <div className="control-panel__section-label" style={{ marginBottom: 6 }}>
              Last Round
            </div>
            <div className="control-panel__score-md" style={{ color: lastScoreColor }}>
              {lastScore >= 0 ? '+' : ''}
              {lastScore.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <div className="control-panel__card">
        <div className="control-panel__section-label">Difficulty</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDifficultyChange(d)}
              className="control-panel__diff-btn"
              style={{
                borderColor: difficulty === d ? '#185FA5' : 'var(--border)',
                background: difficulty === d ? '#e6f1fb' : 'transparent',
                color: difficulty === d ? '#185FA5' : 'var(--text-secondary)',
                fontWeight: difficulty === d ? 500 : 400,
              }}
            >
              {DIFFICULTY_CONFIG[d].label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-panel__card">
        <div className="control-panel__section-label" style={{ marginBottom: 14 }}>
          Adjust your line
        </div>
        {[
          {
            label: 'Slope',
            id: 'slope',
            value: guessSlope,
            min: -3,
            max: 3,
            step: 0.01,
            display: guessSlope.toFixed(2),
            onChange: onSlopeChange,
          },
          {
            label: 'Intercept',
            id: 'intercept',
            value: guessIntercept,
            min: 0,
            max: 100,
            step: 0.5,
            display: guessIntercept.toFixed(1),
            onChange: onInterceptChange,
          },
        ].map((s) => (
          <div key={s.id} style={{ marginBottom: s.id === 'slope' ? 16 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="control-panel__slider-label">{s.label}</span>
              <span className="control-panel__slider-value">{s.display}</span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              disabled={phase === 'submitted'}
              onChange={(e) => s.onChange(parseFloat(e.target.value))}
              style={{ width: '100%', opacity: phase === 'submitted' ? 0.4 : 1 }}
            />
          </div>
        ))}
      </div>

      <div className="control-panel__card" style={{ overflow: 'visible' }}>
        <div className="control-panel__section-label">Model Metrics</div>
        <div className="control-panel__metrics-grid">
          {metrics.map((m) => (
            <div key={m.label} className="control-panel__metric-cell">
              <div className="control-panel__metric-label">
                {m.label}
                <MetricTooltip tip={m.tip} />
              </div>
              <div className="control-panel__metric-value">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {whatHappened && (
        <div
          className="control-panel__card"
          style={{ background: 'var(--bg-muted)' }}
        >
          <div className="control-panel__section-label">What happened</div>
          <p className="control-panel__body-text">{whatHappened}</p>
        </div>
      )}

      {feedback && (
        <div
          className="control-panel__feedback"
          style={{
            background: toneColors[feedback.tone].bg,
            border: `0.5px solid ${toneColors[feedback.tone].border}`,
            color: toneColors[feedback.tone].text,
          }}
        >
          {feedback.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        <button type="button" onClick={onReset} className="control-panel__btn control-panel__btn--ghost">
          Reset
        </button>
        {phase === 'guessing' ? (
          <button
            type="button"
            onClick={onSubmit}
            className="control-panel__btn control-panel__btn--primary"
            style={{ background: '#1a1916', color: '#fff' }}
          >
            Submit Guess
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="control-panel__btn control-panel__btn--primary"
            style={{ background: '#185FA5', color: '#fff' }}
          >
            Next Round →
          </button>
        )}
      </div>
    </div>
  )
}
