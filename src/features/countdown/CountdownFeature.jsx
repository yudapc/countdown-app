import React, { useState } from 'react';
import CountDown from './components/CountDown';
import SetTimer from './components/SetTimer';
import { useCountdown } from '../../shared';

const CountdownFeature = () => {
  const { formattedTime, isActive, remainingSeconds, startCountdown, stopCountdown } = useCountdown();
  const [minutes, setMinutes] = useState(0);

  const handleStart = (value) => {
    const nextMinutes = Number(value);
    if (Number.isNaN(nextMinutes) || nextMinutes <= 0) {
      return;
    }

    setMinutes(nextMinutes);
    startCountdown(nextMinutes);
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
        {isActive && <button className="countdown-action-btn countdown-stop-btn" onClick={stopCountdown} disabled={!isActive}>
          Stop
        </button>}

        {!isActive && <SetTimer initialValue={minutes} onStart={handleStart} />}
      </div>
    </div>
  );
};

export default CountdownFeature;
