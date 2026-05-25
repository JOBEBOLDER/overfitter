interface Props {
  tip: string
}

/** Hover-only `?` — hidden until the user asks */
export default function MetricTooltip({ tip }: Props) {
  return (
    <span className="metric-tooltip">
      <button
        type="button"
        className="metric-tooltip__trigger"
        aria-label={tip}
        tabIndex={0}
      >
        ?
      </button>
      <span className="metric-tooltip__content" role="tooltip">
        {tip}
      </span>
    </span>
  )
}
