import React from 'react';

const CenteredColumn = ({ children, gap = '50px', style = {} }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default CenteredColumn;
