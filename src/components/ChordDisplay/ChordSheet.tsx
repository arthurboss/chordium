import React from 'react';

interface ChordSheetProps {
  children: React.ReactNode;
  className?: string;
}

const ChordSheet: React.FC<ChordSheetProps> = ({ children, className }) => {
  return (
    <pre 
      className={`font-mono text-xs overflow-x-auto whitespace-pre mb-3 p-3 rounded-md bg-muted/50 border border-border shadow-sm ${className || ''}`}
      style={{ overflowWrap: 'break-word', maxWidth: '100%' }}
    >
      {children}
    </pre>
  );
};

export { ChordSheet };
export default ChordSheet;