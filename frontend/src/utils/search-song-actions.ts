import { useCallback } from 'react';
import { Song } from '@/types/song';
import { useNavigate } from 'react-router-dom';
import { useEnhancedSongSelection } from './enhanced-song-selection';
import type { UseSongActionsProps } from '@/search/types';

export const useSongActions = ({ 
  setMySongs,
  memoizedSongs,
  setActiveTab,
  setSelectedSong,
  myChordSheets
}: UseSongActionsProps) => {
  const navigate = useNavigate();
  
  // Use the enhanced song selection hook for deduplication
  const { handleSongSelection } = useEnhancedSongSelection({
    navigate,
    setSelectedSong,
    setActiveTab,
    myChordSheets
  });

  const handleView = useCallback((songData: Song) => {
    handleSongSelection(songData);
  }, [handleSongSelection]);

  const handleAdd = useCallback((songId: string) => {
    if (!setMySongs) return;
    const item = memoizedSongs.find(song => 
      song.path === songId || song.title === songId
    );
    if (item) {
      // Check if song already exists in My Chord Sheets by path (much cleaner!)
      setMySongs(prev => {
        const existing = prev.find(existingSong => existingSong.path === item.path);
        
        if (existing) {
          return prev; // Don't add duplicate
        }
        
        return [...prev, item];
      });
    }
  }, [setMySongs, memoizedSongs]);

  return {
    handleView,
    handleAdd
  };
};
