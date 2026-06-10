import { useRef, useCallback, useState } from 'react'
import { usePersistentCount } from './hooks'

const TOTAL_BEADS = 33
const ANGLE_STEP = 360 / TOTAL_BEADS
const GAP_DEG = 7

const TasbihFeature = () => {
  const [count, setCount] = usePersistentCount()
  const displayRef = useRef(null)
  const [slideIndex, setSlideIndex] = useState(0)

  const bump = useCallback(() => {
    if (!displayRef.current) return
    displayRef.current.classList.remove('bump')
    void displayRef.current.offsetWidth
    displayRef.current.classList.add('bump')
  }, [])

  const handleIncrement = () => {
    setCount((prev) => prev + 1)
    setSlideIndex((prev) => (prev + 1) % TOTAL_BEADS)
    bump()
  }

  const handleDecrement = () => {
    if (count <= 0) return
    setCount((prev) => prev - 1)
    setSlideIndex((prev) => (prev - 1 + TOTAL_BEADS) % TOTAL_BEADS)
  }

  const handleReset = () => {
    const isConfirmed = window.confirm('Reset tasbih ke 0?')
    if (!isConfirmed) return
    setCount(0)
    setSlideIndex(0)
  }

  return (
    <div className="tasbih-page">
      <div className="tasbih-top">
        <span className="tasbih-label">Tasbih</span>

        <div className="tasbih-beads-wrap">
          <div className="tasbih-beads">
            <svg className="tasbih-string" viewBox="0 0 280 280" width="280" height="280" aria-hidden="true">
              <circle cx="140" cy="140" r="120" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15" />
            </svg>
            <div className="tasbih-display" ref={displayRef}>
              {count.toLocaleString('id-ID')}
            </div>
            {Array.from({ length: TOTAL_BEADS }).map((_, i) => {
              const baseAngle = i * ANGLE_STEP - 90
              const gapShift = i > slideIndex ? GAP_DEG : 0
              const angle = baseAngle + gapShift
              const state = i < slideIndex ? 'counted' : i === slideIndex ? 'active' : 'uncounted'
              return (
                <div
                  key={i}
                  className={`tasbih-bead ${state}`}
                  style={{ '--angle': `${angle}deg` }}
                >
                  <div className="tasbih-bead-inner" />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="tasbih-bottom">
        <div className="tasbih-secondary">
          <button
            className="tasbih-icon-btn"
            onClick={handleDecrement}
            disabled={count <= 0}
            aria-label="Kurang"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 12h12v2H6z" />
            </svg>
          </button>
          <button
            className="tasbih-icon-btn"
            onClick={handleReset}
            aria-label="Reset"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 5a7 7 0 1 1-6.74 8.9h2.08A5 5 0 1 0 8.2 9.7L11 12.5H4.5V6l2.28 2.28A6.96 6.96 0 0 1 12 5Z" />
            </svg>
          </button>
        </div>

        <button
          className="tasbih-plus-btn"
          onClick={handleIncrement}
          aria-label="Tambah"
        >
          <span className="tasbih-plus-ripple" />
          <span className="tasbih-plus-text">+</span>
        </button>
      </div>
    </div>
  )
}

export default TasbihFeature
