import { useCallback } from 'react';
import { Song } from '@/types/song';
import { findExistingSong } from './song-deduplication';
import { toSlug } from '@/utils/url-slug-utils';
import { NavigateFunction } from 'react-router-dom';

export interface EnhancedSongSelectionProps {
  navigate?: NavigateFunction;
  setSelectedSong?: React.Dispatch<React.SetStateAction<Song | null>>;
  setActiveTab?: (tab: string) => void;
  myChordSheets: Song[];
}

export interface EnhancedSongSelectionReturn {
  handleSongSelection: (song: Song) => void;
}

/**
 * Enhanced song selection hook that checks for duplicates in My Chord Sheets
 * before navigating to a song. Works for both search results and sample songs.
 */
export function useEnhancedSongSelection({
  navigate,
  setSelectedSong,
  setActiveTab,
  myChordSheets
}: EnhancedSongSelectionProps): EnhancedSongSelectionReturn {
  
  const navigateToExistingSong = useCallback((existingSong: Song) => {
    console.log('[Enhanced Song Selection] Found existing song in My Chord Sheets:', existingSong);
    
    if (navigate) {
      const artistSlug = toSlug(existingSong.artist || '');
      const songSlug = toSlug(existingSong.title || '');
      navigate(`/my-chord-sheets/${artistSlug}/${songSlug}`);
    }
    
    if (setSelectedSong) {
      setSelectedSong(existingSong);
    }
    
    if (setActiveTab) {
      setActiveTab('my-chord-sheets');
    }
  }, [navigate, setSelectedSong, setActiveTab]);

  const navigateToNewSong = useCallback((song: Song) => {
    console.log('[Enhanced Song Selection] Song not found in My Chord Sheets, proceeding with normal navigation');
    
    if (song.artist && song.title && navigate) {
      const artistSlug = toSlug(song.artist);
      const songSlug = toSlug(song.title);
      
      console.log('[Enhanced Song Selection] Navigating to song:', `/${artistSlug}/${songSlug}`, 'with song data:', song);
      navigate(`/${artistSlug}/${songSlug}`, { 
        state: { song: song } 
      });
    } else if (song.path && navigate) {
      console.log('[Enhanced Song Selection] Using fallback approach - opening song path');
      navigate(`/song/${encodeURIComponent(song.path)}`, {
        state: { song: song }
      });
    }
  }, [navigate]);
  
  const handleSongSelection = useCallback((song: Song) => {
    console.log('[Enhanced Song Selection] Processing song:', song);
    
    // Check if the song already exists in My Chord Sheets
    if (song.artist && song.title) {
      const existingInMySongs = findExistingSong(myChordSheets, song.artist, song.title);
      
      if (existingInMySongs) {
        navigateToExistingSong(existingInMySongs);
        return;
      }
    }
    
    // If song doesn't exist in My Chord Sheets, proceed with normal navigation
    navigateToNewSong(song);
  }, [myChordSheets, navigateToExistingSong, navigateToNewSong]);

  return {
    handleSongSelection
  };
}
