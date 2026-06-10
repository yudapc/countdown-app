import { useState } from 'react'
import { SetTimer } from './components'
import { useCountdown } from '../../shared'

const RING_RADIUS = 110
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const CountdownFeature = () => {
  const { formattedTime, isActive, progress, startCountdown, stopCountdown } = useCountdown()
  const [minutes, setMinutes] = useState(0)

  const handleStart = (value) => {
    const nextMinutes = Number(value)
    if (Number.isNaN(nextMinutes) || nextMinutes <= 0) return
    setMinutes(nextMinutes)
    startCountdown(nextMinutes)
  }

  const offset = RING_CIRCUMFERENCE * (1 - progress)

  return (
    <div className="countdown-page">
      <div className="countdown-ring-wrap">
        <svg className="countdown-ring-bg" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r={RING_RADIUS} />
        </svg>
        <svg className="countdown-ring-fg" viewBox="0 0 240 240">
          <circle
            cx="120"
            cy="120"
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={String(offset)}
          />
        </svg>
        <div className="countdown-center">
          <span className="countdown-time">{formattedTime}</span>
          <span className="countdown-status">
            {isActive ? 'berjalan' : 'menunggu'}
          </span>
        </div>
      </div>

      {isActive ? (
        <button
          className="countdown-action-btn stop-btn"
          onClick={stopCountdown}
        >
          Berhenti
        </button>
      ) : (
        <SetTimer initialValue={minutes} onStart={handleStart} />
      )}
    </div>
  )
}

export default CountdownFeature
