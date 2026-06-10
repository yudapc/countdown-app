import { useLocalStorageState } from '../../../shared'

const COUNTER_STORAGE_KEY = 'tasbih-count-value'

const usePersistentCount = () => {
  const [count, setCount] = useLocalStorageState(COUNTER_STORAGE_KEY, 0)
  return [count, setCount]
}

export default usePersistentCount
