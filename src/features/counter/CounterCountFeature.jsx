import React from 'react';
import usePersistentCount from './hooks/usePersistentCount';
import { ActionRow, CenteredColumn } from '../../shared';

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
    <CenteredColumn>
      <h2 style={{ margin: 0 }}>Count: {count}</h2>
      <ActionRow
        style={{
          width: '100%',
          flexWrap: 'wrap',
        }}
        gap="10px"
      >
        <button className="counter-action-btn" onClick={() => setCount((prev) => prev + 1)}>
          +
        </button>
        <button
          className="counter-action-btn"
          onClick={() => setCount((prev) => prev - 1)}
          disabled={count === 0}
          aria-disabled={count === 0}
        >
          -
        </button>
        <button className="counter-action-btn counter-reset-btn" onClick={handleReset}>
          Reset
        </button>
      </ActionRow>
      <small style={{ opacity: 0.8 }}>Nilai counter disimpan di device (local).</small>
    </CenteredColumn>
  );
};

export default CounterCountFeature;
