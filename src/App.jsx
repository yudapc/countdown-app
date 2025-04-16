import './App.css'
import CountDown from './CountDown'
import React, { useState } from 'react'
import SetTimer from './SetTimer'

function App() {
  const [minutes, setMinutes] = useState(0)
  const [isStart, setIsStart] = useState(false)
  const [isSetTimer, setIsSetTimer] = useState(false)

  const handleStart = (value) => {
    setMinutes((prev) => {
      if (prev !== value) {
        setIsStart(true);
        setIsSetTimer(false);
        return value;
      }
      return prev;
    });
  };

  return (
    <>
      <div className="card">
      <h1>Halo</h1>
        {isStart && <CountDown minutes={minutes} />}
        <button onClick={() => setIsSetTimer(!isSetTimer)}>
          {isSetTimer ? 'Hide' : 'Show'} Set Timer
        </button>
        {isSetTimer && (
          <SetTimer value={minutes} handleStart={handleStart} />
        )}
      </div>
      <p className="read-the-docs">
        Live tiktok koding bareng
      </p>
    </>
  )
}

export default App
