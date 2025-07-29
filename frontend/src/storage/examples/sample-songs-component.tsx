/**
 * Example component demonstrating usage of the new useSampleSongs hook
 * 
 * This shows how to integrate the IndexedDB-based sample songs loading
 * into a React component for development mode.
 */

import React from 'react';
import { useSampleSongs } from '../hooks/use-sample-songs';

/**
 * Sample component that loads sample songs in development mode
 */
export const SampleSongsExample: React.FC = () => {
  const { isLoading, error, isLoaded } = useSampleSongs();

  if (isLoading) {
    return (
      <div className="sample-songs-status">
        <p>🎵 Loading sample songs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sample-songs-status error">
        <p>❌ Error loading sample songs: {error.message}</p>
      </div>
    );
  }

  if (isLoaded) {
    return (
      <div className="sample-songs-status success">
        <p>✅ Sample songs loaded successfully!</p>
        <p>You can now browse and play:</p>
        <ul>
          <li>🎸 Oasis - Wonderwall</li>
          <li>🎸 Eagles - Hotel California</li>
        </ul>
      </div>
    );
  }

  // Not in development mode
  return (
    <div className="sample-songs-status">
      <p>📝 Sample songs are only available in development mode</p>
    </div>
  );
};

export default SampleSongsExample;
