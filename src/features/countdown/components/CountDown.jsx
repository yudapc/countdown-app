import React, { memo } from 'react';

const formatTime = (seconds) => {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
};

const CountDown = ({ secondsLeft, isActive }) => {
  if (!isActive && secondsLeft === 0) {
    return <p className="countdown-message">Masukkan waktu (menit) lalu tekan Mulai untuk memulai hitung mundur.</p>;
  }

  return (
    <p className="countdown-time">{formatTime(secondsLeft)}</p>
  );
};

export default memo(CountDown);
