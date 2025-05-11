import React from 'react';

interface ChordHeaderProps {
  title?: string;
  artist?: string;
}

const ChordHeader: React.FC<ChordHeaderProps> = ({ title, artist }) => {
  if (!title && !artist) return null;
  
  return (
    <div className="mb-4 text-center">
      {title && <h1 className="text-2xl font-bold">{title}</h1>}
      {artist && <p className="text-muted-foreground">{artist}</p>}
    </div>
  );
};

export default ChordHeader;
