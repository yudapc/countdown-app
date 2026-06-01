import { useContext } from 'react'
import CountdownContext from '../context/CountdownContext'

const useCountdown = () => {
  const context = useContext(CountdownContext)
  if (!context) {
    throw new Error('useCountdown harus dipakai di dalam CountdownProvider.')
  }

  return context
}

export default useCountdown
