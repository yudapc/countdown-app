import React from 'react';
import { usePersistentCount } from './hooks';
import { CenteredColumn } from '../../shared';

const CounterCountFeature = () => {
  const [count, setCount] = usePersistentCount();

  const handleReset = () => {
    const isConfirmed = window.confirm('Reset counter ke 0?');
    if (!isConfirmed) {
      return;
    }

    setCount(0);
  };

  return (
    <CenteredColumn style={{ width: '100%' }}>
      <h2 style={{ margin: 0, fontSize: '80px' }}>{count}</h2>
      <div className="counter-secondary-actions">
        <button className="counter-icon-btn counter-reset-btn" onClick={handleReset} aria-label="Reset counter">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 5a7 7 0 1 1-6.74 8.9h2.08A5 5 0 1 0 8.2 9.7L11 12.5H4.5V6l2.28 2.28A6.96 6.96 0 0 1 12 5Z" />
          </svg>
        </button>

        <button className="counter-icon-btn counter-minus-btn" onClick={() => setCount((prev) => prev - 1)} disabled={count === 0} aria-disabled={count === 0}>
          -
        </button>
      </div>
      <div className="counter-touch-layout">
        <button className="counter-primary-plus-btn" onClick={() => setCount((prev) => prev + 1)}>
          +
        </button>
      </div>
    </CenteredColumn>
  );
};

export default CounterCountFeature;
