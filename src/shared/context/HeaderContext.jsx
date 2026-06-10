import { createContext, useContext, useState, useCallback } from 'react'

const HeaderContext = createContext(null)

export const HeaderProvider = ({ children }) => {
  const [config, setConfig] = useState({ title: null, onBack: null })

  const setHeader = useCallback((title, onBack) => {
    setConfig({ title, onBack })
  }, [])

  const clearHeader = useCallback(() => {
    setConfig({ title: null, onBack: null })
  }, [])

  return (
    <HeaderContext.Provider value={{ ...config, setHeader, clearHeader }}>
      {children}
    </HeaderContext.Provider>
  )
}

export const useHeader = () => {
  const ctx = useContext(HeaderContext)
  if (!ctx) throw new Error('useHeader must be used within HeaderProvider')
  return ctx
}
