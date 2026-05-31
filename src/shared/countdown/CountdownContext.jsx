import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import useLocalStorageState from '../hooks/useLocalStorageState';

const CountdownContext = createContext(undefined);

const formatCountdown = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(safeSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export const CountdownProvider = ({ children }) => {
  const [endAt, setEndAt] = useLocalStorageState('countdown-end-at', null);
  const [now, setNow] = useState(Date.now());
  const previousRemainingRef = useRef(0);

  useEffect(() => {
    if (!endAt) {
      return;
    }

    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [endAt]);

  const remainingSeconds = (() => {
    if (!endAt) {
      return 0;
    }

    const distanceMs = Number(endAt) - now;
    const computed = Math.ceil(distanceMs / 1000);
    return computed > 0 ? computed : 0;
  })();

  useEffect(() => {
    const previous = previousRemainingRef.current;
    if (previous > 0 && remainingSeconds === 0) {
      const audio = new Audio('/ringtone.wav');
      audio.play().catch(() => {
        // Ignore autoplay restrictions in some browsers.
      });
    }

    previousRemainingRef.current = remainingSeconds;
  }, [remainingSeconds]);

  useEffect(() => {
    if (endAt && remainingSeconds === 0) {
      setEndAt(null);
    }
  }, [endAt, remainingSeconds, setEndAt]);

  const startCountdown = (minutes) => {
    const nextMinutes = Number(minutes);
    if (Number.isNaN(nextMinutes) || nextMinutes < 0) {
      return;
    }

    const durationMs = Math.floor(nextMinutes * 60 * 1000);
    const target = Date.now() + durationMs;
    setEndAt(target);
  };

  const stopCountdown = () => {
    setEndAt(null);
  };

  const value = {
    isActive: Boolean(endAt) && remainingSeconds > 0,
    remainingSeconds,
    formattedTime: formatCountdown(remainingSeconds),
    startCountdown,
    stopCountdown,
  };

  return <CountdownContext.Provider value={value}>{children}</CountdownContext.Provider>;
};

export const useCountdown = () => {
  const context = useContext(CountdownContext);
  if (!context) {
    throw new Error('useCountdown harus dipakai di dalam CountdownProvider.');
  }

  return context;
};
