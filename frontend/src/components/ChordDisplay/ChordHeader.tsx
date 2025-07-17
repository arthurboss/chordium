import React from 'react';
import SongChordDetails from '../SongChordDetails';

interface ChordHeaderProps {
  title?: string;
  artist?: string;
  songKey?: string;
  tuning?: string;
  capo?: string;
}

const ChordHeader: React.FC<ChordHeaderProps> = ({ title, artist, songKey, tuning, capo }) => {
  if (!title && !artist) return null;
  
  return (
    <div className='flex flex-col text-center items-center'>
      <div className='mb-4'>
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        {artist && <p className="text-muted-foreground">{artist}</p>}
      </div>

      <div className='mb-4'>
      <SongChordDetails songKey={songKey} tuning={tuning} capo={capo} />
      </div>
    </div>
  );
};

export default ChordHeader;
