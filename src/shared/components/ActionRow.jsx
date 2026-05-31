import React from 'react';

const ActionRow = ({ children, gap = '8px', justifyContent = 'center', style = {} }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap,
        justifyContent,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default ActionRow;
