import React from 'react';
import { Artist } from '@/types/artist';

interface ArtistSongsLoadingStateProps {
  activeArtist: Artist | null;
}

export const ArtistSongsLoadingState: React.FC<ArtistSongsLoadingStateProps> = ({ activeArtist }) => (
  <div className="p-8 text-center">
    <div className="mb-4">Loading songs for "{activeArtist?.displayName}"...</div>
    <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
        <div className="space-y-2">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export default ArtistSongsLoadingState;
