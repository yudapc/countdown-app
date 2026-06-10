import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'

const AudioContext = createContext(null)

export const AudioProvider = ({ children }) => {
  const [currentSurah, setCurrentSurah] = useState(null)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  const playSurah = useCallback((surahNumber, surahName, audioUrl) => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'none'
      audioRef.current.addEventListener('ended', () => setPlaying(false))
    }

    const audio = audioRef.current

    if (currentSurah?.number === surahNumber && playing) {
      audio.pause()
      setPlaying(false)
      return
    }

    if (currentSurah?.number !== surahNumber) {
      audio.src = audioUrl
      audio.load()
      setCurrentSurah({ number: surahNumber, name: surahName, audioUrl })
    }

    audio.play().catch(() => {})
    setPlaying(true)
  }, [currentSurah, playing])

  const pauseSurah = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setPlaying(false)
    }
  }, [])

  const resumeSurah = useCallback(() => {
    if (audioRef.current && currentSurah) {
      audioRef.current.play().catch(() => {})
      setPlaying(true)
    }
  }, [currentSurah])

  const stopSurah = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      setPlaying(false)
      setCurrentSurah(null)
    }
  }, [])

  const toggleSurah = useCallback((surahNumber, surahName, audioUrl) => {
    if (currentSurah?.number === surahNumber && playing) {
      pauseSurah()
    } else if (currentSurah?.number === surahNumber && !playing) {
      resumeSurah()
    } else {
      stopSurah()
      playSurah(surahNumber, surahName, audioUrl)
    }
  }, [currentSurah, playing, pauseSurah, resumeSurah, stopSurah, playSurah])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, [])

  return (
    <AudioContext.Provider value={{ currentSurah, playing, toggleSurah, pauseSurah, resumeSurah, stopSurah }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}
