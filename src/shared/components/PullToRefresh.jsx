import { useState, useEffect, useRef, useCallback } from 'react'

const THRESHOLD = 70
const MAX_PULL = 110
const DAMPING = 0.45

export default function PullToRefresh({ onRefresh, children }) {
  const [state, setState] = useState('idle')
  const [pullDist, setPullDist] = useState(0)
  const startY = useRef(0)
  const dist = useRef(0)
  const refreshing = useRef(false)

  const reset = useCallback(() => {
    setState('idle')
    setPullDist(0)
    dist.current = 0
  }, [])

  useEffect(() => {
    const el = document.querySelector('.app-main')
    if (!el) return

    const onStart = (e) => {
      if (refreshing.current) return
      if (el.scrollTop > 0) return
      startY.current = e.touches[0].clientY
      dist.current = 0
      setPullDist(0)
      setState('pulling')
    }

    const onMove = (e) => {
      if (refreshing.current) return
      const dy = e.touches[0].clientY - startY.current
      if (el.scrollTop > 0 || dy <= 0) {
        if (dist.current > 0) {
          dist.current = 0
          setPullDist(0)
          setState('idle')
        }
        return
      }
      e.preventDefault()
      dist.current = Math.min(dy * DAMPING, MAX_PULL)
      setPullDist(dist.current)
      setState(dist.current >= THRESHOLD ? 'ready' : 'pulling')
    }

    const onEnd = () => {
      if (refreshing.current) return
      if (dist.current >= THRESHOLD) {
        refreshing.current = true
        setState('refreshing')
        setPullDist(55)
        onRefresh?.()
        setTimeout(() => {
          refreshing.current = false
          reset()
        }, 3000)
      } else {
        reset()
      }
      dist.current = 0
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    el.addEventListener('touchcancel', onEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [onRefresh, reset])

  const arrowDeg = state === 'idle' ? 0 : Math.min((pullDist / THRESHOLD) * 180, 180)

  return (
    <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <div
        className={`ptr-indicator ${state === 'refreshing' ? 'ptr-refreshing' : ''}`}
        style={{
          opacity: state === 'idle' ? 0 : Math.min(pullDist / THRESHOLD, 0.9) + 0.1,
          transform: `translateY(${state === 'refreshing' ? 4 : state === 'idle' ? -56 : Math.min(pullDist - 56, 0)}px)`,
          transition: state === 'pulling' || state === 'idle' ? 'opacity 0.25s ease, transform 0.25s ease' : 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        <svg className="ptr-icon" viewBox="0 0 24 24">
          {state === 'refreshing' ? (
            <g>
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
              </path>
            </g>
          ) : (
            <path
              d="M12 5v14M5 12l7-7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: `rotate(${arrowDeg}deg)`, transformOrigin: 'center', transition: 'transform 0.2s ease' }}
            />
          )}
        </svg>
        <span className="ptr-label">
          {state === 'refreshing'
            ? 'Memuat ulang...'
            : state === 'ready'
              ? 'Lepas untuk muat ulang'
              : 'Tarik untuk muat ulang'}
        </span>
      </div>
      <div
        style={{
          transform: `translateY(${state === 'idle' ? 0 : pullDist}px)`,
          transition: state === 'pulling' ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
