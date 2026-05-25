import ScatterPlot from './components/ScatterPlot'
import ControlPanel from './components/ControlPanel'
import ScoreHistory from './components/ScoreHistory'
import { useGame } from './hooks/useGame'

export default function App() {
  const {
    state,
    metrics,
    feedback,
    lastResult,
    setGuessSlope,
    setGuessIntercept,
    submit,
    nextRound,
    setDifficulty,
    resetGame,
  } = useGame('medium')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'stretch',
        padding: 20,
        gap: 20,
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Plot area */}
      <div
        style={{
          flex: 1,
          background: 'var(--bg-card)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          minHeight: 500,
        }}
      >
        <ScatterPlot
          points={state.points}
          guessSlope={state.guessSlope}
          guessIntercept={state.guessIntercept}
          targetSlope={state.targetSlope}
          targetIntercept={state.targetIntercept}
          olsSlope={state.olsSlope}
          olsIntercept={state.olsIntercept}
          phase={state.phase}
        />
      </div>

      {/* Right panel */}
      <div
        style={{
          width: 300,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          overflowY: 'auto',
        }}
      >
        <ControlPanel
          guessSlope={state.guessSlope}
          guessIntercept={state.guessIntercept}
          mse={metrics.mse}
          mae={metrics.mae}
          r2={metrics.r2}
          phase={state.phase}
          totalScore={state.totalScore}
          lastScore={lastResult?.score ?? null}
          feedback={feedback}
          targetSlope={state.targetSlope}
          targetIntercept={state.targetIntercept}
          difficulty={state.difficulty}
          round={state.round}
          onSlopeChange={setGuessSlope}
          onInterceptChange={setGuessIntercept}
          onSubmit={submit}
          onNext={nextRound}
          onReset={resetGame}
          onDifficultyChange={setDifficulty}
        />
        <ScoreHistory history={state.history} />
      </div>
    </div>
  )
}
