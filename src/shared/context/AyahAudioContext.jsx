import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'

const AyahAudioContext = createContext(null)

export const AyahAudioProvider = ({ children }) => {
  const [currentAyah, setCurrentAyah] = useState(null)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  const stopAyah = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      setPlaying(false)
      setCurrentAyah(null)
    }
  }, [])

  const toggleAyah = useCallback((surahNumber, ayahNumber, audioUrl) => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'none'
      audioRef.current.addEventListener('ended', () => setPlaying(false))
    }

    const audio = audioRef.current

    if (currentAyah?.surahNumber === surahNumber && currentAyah?.ayahNumber === ayahNumber && playing) {
      audio.pause()
      setPlaying(false)
      return
    }

    if (currentAyah?.surahNumber !== surahNumber || currentAyah?.ayahNumber !== ayahNumber) {
      audio.src = audioUrl
      audio.load()
      setCurrentAyah({ surahNumber, ayahNumber, audioUrl })
    }

    audio.play().catch(() => {})
    setPlaying(true)
  }, [currentAyah, playing])

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
    <AyahAudioContext.Provider value={{ currentAyah, playing, toggleAyah, stopAyah }}>
      {children}
    </AyahAudioContext.Provider>
  )
}

export const useAyahAudio = () => {
  const ctx = useContext(AyahAudioContext)
  if (!ctx) throw new Error('useAyahAudio must be used within AyahAudioProvider')
  return ctx
}
