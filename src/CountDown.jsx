import React, { useState, useEffect, memo } from 'react';

const CountDown = ({ minutes }) => {
  const [timeLeft, setTimeLeft] = useState(Number(minutes) * 60);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [timeLeft]);

  const displayFormatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  }

  return (
    <>
      {timeLeft > 0 ? (
        <h2>{displayFormatTime(timeLeft)}</h2>
      ) : (
        <h2>Time's up!</h2>
      )}
    </>
  );
};

export default memo(CountDown);