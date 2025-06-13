import { useCallback } from 'react';
import { Song } from '@/types/song';
import { useNavigate } from 'react-router-dom';
import { toSlug } from '@/utils/url-slug-utils';

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
    
    // For search results: Navigate directly to /:artist/:song
    if (songData.artist && songData.title && navigate) {
      // Create URL-friendly slugs using Unicode-aware function
      const artistSlug = toSlug(songData.artist);
      const songSlug = toSlug(songData.title);
      
      console.log('[handleView] Navigating to search result song:', `/${artistSlug}/${songSlug}`);
      navigate(`/${artistSlug}/${songSlug}`);
    } else if (songData.path) {
      console.log('[handleView] Using fallback approach - opening song path');
      // Fallback for songs with path but no artist/title structure
      navigate(`/song/${encodeURIComponent(songData.path)}`);
    }
  }, [navigate]);

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
