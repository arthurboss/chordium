import { useCallback } from 'react';
import { Song } from '@/types/song';
import { useNavigate } from 'react-router-dom';

export interface UseSongActionsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  memoizedSongs: Song[];
  setActiveTab?: (tab: string) => void;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
}

export const useSongActions = ({ 
  setMySongs, 
  memoizedSongs, 
  setActiveTab, 
  setSelectedSong
}: UseSongActionsProps) => {
  const navigate = useNavigate();
  const handleView = useCallback((songData: Song) => {
    console.log('[handleView] Called with:', songData);
    console.log('[handleView] Navigation props:', { setActiveTab: !!setActiveTab, setSelectedSong: !!setSelectedSong });
    
    // Navigate to My Songs tab and show the song in SongViewer
    if (setActiveTab && setSelectedSong && navigate) {
      console.log('[handleView] Using navigation approach');
      // Create a temporary song object for the viewer
      const tempSong: Song = {
        ...songData,
        path: songData.path || `temp-${Date.now()}`, // Ensure we have a path
      };
      
      console.log('[handleView] Setting selected song:', tempSong);
      // Set the song as selected
      setSelectedSong(tempSong);
      
      console.log('[handleView] Setting active tab to my-songs');
      // Switch to My Songs tab
      setActiveTab('my-songs');
      
      console.log('[handleView] Navigating to:', `/my-songs?song=${encodeURIComponent(tempSong.path)}`);
      // Navigate with the song parameter
      navigate(`/my-songs?song=${encodeURIComponent(tempSong.path)}`);
    } else if (songData.path) {
      console.log('[handleView] Using fallback approach - opening in new tab');
      // Fallback to opening in new tab if navigation props not available
      window.open(songData.path, '_blank');
    }
  }, [setActiveTab, setSelectedSong, navigate]);

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
