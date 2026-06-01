import React, { memo, useEffect, useState } from 'react';
import { CenteredColumn } from '../../../shared';

const SetTimer = ({ initialValue = 0, onStart }) => {
  const [valueInput, setValueInput] = useState(
    Number(initialValue) > 0 ? String(initialValue) : ''
  );

  useEffect(() => {
    setValueInput(Number(initialValue) > 0 ? String(initialValue) : '');
  }, [initialValue]);

  const handleChangeMinutes = (event) => {
    const inputValue = event.target.value;
    if (inputValue === '') {
      setValueInput('');
      return;
    }

    const nextValue = Number(inputValue);
    if (!Number.isNaN(nextValue) && nextValue >= 0) {
      setValueInput(inputValue);
      return;
    }

    alert('Please enter a valid number');
  };

  const numericValue = Number(valueInput);
  const canStart = valueInput !== '' && !Number.isNaN(numericValue) && numericValue > 0;

  const handleStart = () => {
    if (!canStart) {
      return;
    }

    onStart(numericValue);
  };

  return (
    <CenteredColumn style={{ marginTop: '0px', justifyContent: 'center', width: '100%' }}>
      <input
        className="countdown-input"
        type="number"
        min="0"
        step="1"
        placeholder="Masukkan menit"
        value={valueInput}
        onChange={handleChangeMinutes}
      />
      <small className="countdown-input-hint">Satuan input adalah menit.</small>
      <button
        className="countdown-action-btn countdown-start-btn"
        onClick={handleStart}
        disabled={!canStart}
      >
        Mulai
      </button>
    </CenteredColumn>
  );
};

export default memo(SetTimer);
