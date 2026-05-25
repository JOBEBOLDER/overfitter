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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.8px' }}>Overfitter</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 400 }}>
            Round {round}
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          Welcome. You're probably going to overfit.
        </p>
      </div>

      {/* Score */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Total Score
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: scoreColor, fontVariantNumeric: 'tabular-nums' }}>
            {totalScore > 0 ? '+' : ''}{totalScore.toLocaleString()}
          </div>
        </div>
        {lastScore !== null && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Last Round
            </div>
            <div style={{ fontSize: 20, fontWeight: 500, color: lastScoreColor, fontVariantNumeric: 'tabular-nums' }}>
              {lastScore >= 0 ? '+' : ''}{lastScore.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Difficulty
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => onDifficultyChange(d)}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 8,
                border: '0.5px solid',
                borderColor: difficulty === d ? '#185FA5' : 'var(--border)',
                background: difficulty === d ? '#e6f1fb' : 'transparent',
                color: difficulty === d ? '#185FA5' : 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: difficulty === d ? 500 : 400,
                transition: 'all 0.15s',
              }}
            >
              {DIFFICULTY_CONFIG[d].label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Adjust your line
        </div>

        {[
          { label: 'Slope', id: 'slope', value: guessSlope, min: -3, max: 3, step: 0.01, display: guessSlope.toFixed(2), onChange: onSlopeChange },
          { label: 'Intercept', id: 'intercept', value: guessIntercept, min: 0, max: 100, step: 0.5, display: guessIntercept.toFixed(1), onChange: onInterceptChange },
        ].map((s) => (
          <div key={s.id} style={{ marginBottom: s.id === 'slope' ? 14 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)' }}>
                {s.display}
              </span>
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

      {/* Metrics */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Model Metrics
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(phase === 'submitted'
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
          ).map((m) => (
            <div
              key={m.label}
              style={{
                background: 'var(--bg-muted)',
                borderRadius: 8,
                padding: '8px 12px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-tertiary)',
                  marginBottom: 3,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {m.label}
                <MetricTooltip tip={m.tip} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 500, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What happened — only after submit */}
      {whatHappened && (
        <div
          style={{
            background: 'var(--bg-muted)',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}
          >
            What happened
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{whatHappened}</p>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          style={{
            background: toneColors[feedback.tone].bg,
            border: `0.5px solid ${toneColors[feedback.tone].border}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: 13,
            color: toneColors[feedback.tone].text,
            lineHeight: 1.6,
          }}
        >
          {feedback.text}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button
          onClick={onReset}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: '0.5px solid var(--border-strong)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 400,
          }}
        >
          Reset
        </button>
        {phase === 'guessing' ? (
          <button
            onClick={onSubmit}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#1a1916',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.2px',
            }}
          >
            Submit Guess
          </button>
        ) : (
          <button
            onClick={onNext}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#185FA5',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.2px',
            }}
          >
            Next Round →
          </button>
        )}
      </div>
    </div>
  )
}
