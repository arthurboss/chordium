import { useCallback } from 'react';
import { Song } from '@/types/song';
import { useNavigate } from 'react-router-dom';
import { useEnhancedSongSelection } from './enhanced-song-selection';

export interface UseSongActionsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  memoizedSongs: Song[];
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
  // New prop for My Songs to enable deduplication
  mySongs?: Song[];
}

export const useSongActions = ({ 
  setMySongs, 
  memoizedSongs, 
  setActiveTab, 
  setSelectedSong,
  mySongs = []
}: UseSongActionsProps) => {
  const navigate = useNavigate();
  
  // Use the enhanced song selection hook for deduplication
  const { handleSongSelection } = useEnhancedSongSelection({
    navigate,
    setSelectedSong,
    setActiveTab,
    mySongs
  });

  const handleView = useCallback((songData: Song) => {
    console.log('[handleView] Called with enhanced song selection:', songData);
    handleSongSelection(songData);
  }, [handleSongSelection]);

  const handleAdd = useCallback((songId: string) => {
    if (!setMySongs) return;
    const item = memoizedSongs.find(song => 
      song.path === songId || song.title === songId
    );
    if (item) {
      setMySongs(prev => [...prev, item]);
    }
  }, [setMySongs, memoizedSongs]);

  return {
    handleView,
    handleAdd
  };
};
