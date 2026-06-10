import { memo, useEffect, useState } from 'react'

const SetTimer = ({ initialValue = 0, onStart }) => {
  const [valueInput, setValueInput] = useState(
    Number(initialValue) > 0 ? String(initialValue) : ''
  )

  useEffect(() => {
    setValueInput(Number(initialValue) > 0 ? String(initialValue) : '')
  }, [initialValue])

  const handleChange = (e) => {
    const v = e.target.value
    if (v === '') {
      setValueInput('')
      return
    }
    const n = Number(v)
    if (!Number.isNaN(n) && n >= 0) {
      setValueInput(v)
    }
  }

  const num = Number(valueInput)
  const canStart = valueInput !== '' && !Number.isNaN(num) && num > 0

  const handleStart = () => {
    if (!canStart) return
    onStart(num)
  }

  return (
    <div className="countdown-input-wrap animate-in">
      <input
        className="countdown-input"
        type="number"
        min="0"
        step="1"
        placeholder="Masukkan menit"
        value={valueInput}
        onChange={handleChange}
        autoFocus
      />
      <span className="countdown-hint">Masukkan durasi dalam menit</span>
      <button
        className="countdown-action-btn start-btn"
        onClick={handleStart}
        disabled={!canStart}
      >
        Mulai
      </button>
    </div>
  )
}

export default memo(SetTimer)
