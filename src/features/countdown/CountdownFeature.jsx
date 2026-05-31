import React, { useState } from 'react';
import CountDown from './components/CountDown';
import SetTimer from './components/SetTimer';
import { useCountdown } from '../../shared';

const CountdownFeature = () => {
  const { formattedTime, isActive, remainingSeconds, startCountdown, stopCountdown } = useCountdown();
  const [minutes, setMinutes] = useState(0);
  const [isSetTimer, setIsSetTimer] = useState(false);

  const handleStart = (value) => {
    const nextMinutes = Number(value);
    if (Number.isNaN(nextMinutes) || nextMinutes <= 0) {
      return;
    }

    setMinutes(nextMinutes);
    startCountdown(nextMinutes);
    setIsSetTimer(false);
  };

  return (
    <div className="countdown-feature">
      <div className="countdown-header">
        <p className="countdown-caption">Current Session</p>
        <h2 className="countdown-time">{formattedTime}</h2>
        {isActive ? <p className="countdown-status">Timer sedang berjalan</p> : <p className="countdown-status">Timer belum aktif</p>}
      </div>

      <CountDown secondsLeft={remainingSeconds} isActive={isActive} />

      <div className="countdown-actions">
        <button className="countdown-action-btn" onClick={() => setIsSetTimer((prev) => !prev)}>
          {isSetTimer ? 'Hide' : 'Show'} Set Timer
        </button>
        <button className="countdown-action-btn countdown-stop-btn" onClick={stopCountdown} disabled={!isActive}>
          Stop
        </button>
      </div>

      {isSetTimer && <SetTimer initialValue={minutes} onStart={handleStart} />}
    </div>
  );
};

export default CountdownFeature;
