import { useRef, useCallback } from 'react'
import { usePersistentCount } from './hooks'

const CounterCountFeature = () => {
  const [count, setCount] = usePersistentCount()
  const displayRef = useRef(null)

  const bump = useCallback(() => {
    if (!displayRef.current) return
    displayRef.current.classList.remove('bump')
    void displayRef.current.offsetWidth
    displayRef.current.classList.add('bump')
  }, [])

  const handleIncrement = () => {
    setCount((prev) => prev + 1)
    bump()
  }

  const handleDecrement = () => {
    if (count <= 0) return
    setCount((prev) => prev - 1)
    bump()
  }

  const handleReset = () => {
    const isConfirmed = window.confirm('Reset counter ke 0?')
    if (!isConfirmed) return
    setCount(0)
  }

  return (
    <div className="counter-page">
      <div className="counter-top">
        <span className="counter-label">Counter</span>
        <div className="counter-display" ref={displayRef}>
          {count.toLocaleString('id-ID')}
        </div>
      </div>

      <div className="counter-bottom">
        <div className="counter-secondary">
          <button
            className="counter-icon-btn"
            onClick={handleDecrement}
            disabled={count <= 0}
            aria-label="Kurang"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 12h12v2H6z" />
            </svg>
          </button>

          <button
            className="counter-icon-btn"
            onClick={handleReset}
            aria-label="Reset"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 5a7 7 0 1 1-6.74 8.9h2.08A5 5 0 1 0 8.2 9.7L11 12.5H4.5V6l2.28 2.28A6.96 6.96 0 0 1 12 5Z" />
            </svg>
          </button>
        </div>

        <button
          className="counter-plus-btn"
          onClick={handleIncrement}
          aria-label="Tambah"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default CounterCountFeature
