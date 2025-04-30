import * as React from 'react';

export function Attribute({ attribute }: { attribute: string }) {
  return (
    <p
      style={{
        margin: '10px 0',
        fontSize: 14,
        width: 100,
        color: '#4e5969',
      }}
    >
      {attribute}
    </p>
  );
}
