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
      // Check if song already exists in My Songs by path (much cleaner!)
      setMySongs(prev => {
        const existing = prev.find(existingSong => existingSong.path === item.path);
        
        if (existing) {
          console.log('[handleAdd] Song already exists in My Songs:', item.title, 'by', item.artist);
          return prev; // Don't add duplicate
        }
        
        console.log('[handleAdd] Adding new song to My Songs:', item.title, 'by', item.artist);
        return [...prev, item];
      });
    }
  }, [setMySongs, memoizedSongs]);

  return {
    handleView,
    handleAdd
  };
};
