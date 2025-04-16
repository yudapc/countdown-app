import React, { useState, memo } from 'react';

const SetTimer = ({ value, handleStart }) => {
  const [valueInput, setValueInput] = useState(0);
  const handleChangeMinutes = (event) => {
    const inputValue = event.target.value;
    if (!isNaN(inputValue) && inputValue >= 0) {
      value = Number(inputValue);
      setValueInput(value);
    } else {
      alert('Please enter a valid number');
    }
  };
  console.log('SetTimer: ', {valueInput, value});
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '20px',
    }}>
      <input type="number" placeholder="input minutes" onChange={handleChangeMinutes} />
      <br />
      <button 
        onClick={() => {
          handleStart(valueInput);
        }}
        style={{
          width: '100%',
        }}
      >Start</button>
    </div>
  );
};
export default memo(SetTimer);