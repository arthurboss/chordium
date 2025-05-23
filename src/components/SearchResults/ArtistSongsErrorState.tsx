import React from 'react';
import { Artist } from '@/types/artist';

interface ArtistSongsErrorStateProps {
  activeArtist: Artist | null;
  error: string;
}

export const ArtistSongsErrorState: React.FC<ArtistSongsErrorStateProps> = ({ activeArtist, error }) => (
  <div className="p-8 flex flex-col items-center">
    <div className="text-red-500 mb-4">
      Error loading songs for "{activeArtist?.displayName}": {error}
    </div>
  </div>
);

export default ArtistSongsErrorState;
