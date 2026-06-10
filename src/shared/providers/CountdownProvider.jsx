import React, { useCallback, useEffect, useRef, useState } from 'react'
import CountdownContext from '../context/CountdownContext'
import useLocalStorageState from '../hooks/useLocalStorageState'

const formatCountdown = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds)
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(safeSeconds % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const CountdownProvider = ({ children }) => {
  const [endAt, setEndAt] = useLocalStorageState('countdown-end-at', null)
  const [startedAt, setStartedAt] = useLocalStorageState('countdown-started-at', null)
  const [now, setNow] = useState(Date.now())
  const previousRemainingRef = useRef(0)
  const hasHydratedRef = useRef(false)
  const isManualStopRef = useRef(false)
  const alarmAudioRef = useRef(null)
  const hasUnlockedAudioRef = useRef(false)

  const ensureAudio = useCallback(() => {
    if (!alarmAudioRef.current) {
      const audio = new Audio('/ringtone.wav')
      audio.preload = 'auto'
      alarmAudioRef.current = audio
    }

    return alarmAudioRef.current
  }, [])

  const unlockAudioPlayback = useCallback(async () => {
    if (hasUnlockedAudioRef.current) {
      return
    }

    const audio = ensureAudio()
    const previousMuted = audio.muted
    audio.muted = true

    try {
      await audio.play()
      audio.pause()
      audio.currentTime = 0
      hasUnlockedAudioRef.current = true
    } catch {
      // Some browsers keep autoplay locked until stronger user activation.
    } finally {
      audio.muted = previousMuted
    }
  }, [ensureAudio])

  const playAlarm = useCallback(async () => {
    const audio = ensureAudio()

    try {
      audio.currentTime = 0
      audio.muted = false
      await audio.play()
    } catch {
      const fallback = new Audio('/ringtone.wav')
      fallback.play().catch(() => {
        // Ignore autoplay restrictions in some browsers.
      })
    }
  }, [ensureAudio])

  useEffect(() => {
    ensureAudio()
  }, [ensureAudio])

  useEffect(() => {
    if (!endAt) {
      return
    }

    const timerId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [endAt])

  const remainingSeconds = (() => {
    if (!endAt) {
      return 0
    }

    const distanceMs = Number(endAt) - now
    const computed = Math.ceil(distanceMs / 1000)
    return computed > 0 ? computed : 0
  })()

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true
      previousRemainingRef.current = remainingSeconds
      return
    }

    const previous = previousRemainingRef.current
    if (previous > 0 && remainingSeconds === 0 && !isManualStopRef.current) {
      playAlarm()
    }

    if (remainingSeconds === 0) {
      isManualStopRef.current = false
    }

    previousRemainingRef.current = remainingSeconds
  }, [playAlarm, remainingSeconds])

  useEffect(() => {
    if (endAt && remainingSeconds === 0) {
      setEndAt(null)
      setStartedAt(null)
    }
  }, [endAt, remainingSeconds, setEndAt, setStartedAt])

  const totalMs = startedAt && endAt ? Number(endAt) - Number(startedAt) : 0
  const elapsedMs = startedAt ? now - Number(startedAt) : 0
  const progress = totalMs > 0 ? Math.min(1, Math.max(0, elapsedMs / totalMs)) : 0

  const startCountdown = (minutes) => {
    const nextMinutes = Number(minutes)
    if (Number.isNaN(nextMinutes) || nextMinutes < 0) {
      return
    }

    isManualStopRef.current = false
    unlockAudioPlayback()
    const nowMs = Date.now()
    const durationMs = Math.floor(nextMinutes * 60 * 1000)
    const target = nowMs + durationMs
    setStartedAt(nowMs)
    setEndAt(target)
  }

  const stopCountdown = () => {
    isManualStopRef.current = true
    setEndAt(null)
    setStartedAt(null)
  }

  const value = {
    isActive: Boolean(endAt) && remainingSeconds > 0,
    remainingSeconds,
    formattedTime: formatCountdown(remainingSeconds),
    progress,
    startCountdown,
    stopCountdown,
  }

  return <CountdownContext.Provider value={value}>{children}</CountdownContext.Provider>
}

export default CountdownProvider
