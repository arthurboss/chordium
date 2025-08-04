import { useCallback } from 'react';
import { Song } from '@/types/song';
import { useNavigate } from 'react-router-dom';
import { toSlug } from '@/utils/url-slug-utils';
import type { UseSongActionsProps } from '@/search/types';

export const useSongActions = ({ 
  setMySongs,
  memoizedSongs
}: UseSongActionsProps) => {
  const navigate = useNavigate();
  
  const handleView = useCallback((songData: Song) => {
    // Navigate directly to chord sheet page - no deduplication needed
    // Search is for discovery, chord sheets are handled separately
    if (songData.artist && songData.title) {
      const artistSlug = toSlug(songData.artist);
      const songSlug = toSlug(songData.title);
      const targetUrl = `/${artistSlug}/${songSlug}`;
      
      navigate(targetUrl, {
        state: { song: songData }
      });
    }
  }, [navigate]);

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
