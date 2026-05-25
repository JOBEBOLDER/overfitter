import ScatterPlot from './components/ScatterPlot'
import ControlPanel from './components/ControlPanel'
import ScoreHistory from './components/ScoreHistory'
import { useGame } from './hooks/useGame'

export default function App() {
  const {
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
  } = useGame('medium')

  return (
    <div
      className="app-layout"
      style={{
        background: 'var(--bg)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Plot area — capped height so the chart does not dominate */}
      <div className="app-plot">
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

      {/* Right panel — equal width/height with chart */}
      <div className="app-sidebar">
        <div className="app-sidebar__scroll">
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
          whatHappened={whatHappened}
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
    </div>
  )
}
