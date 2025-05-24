import { useCallback } from 'react';
import { SongData } from '@/types/song';
import { ArtistSong } from '@/types/artistSong';
import { formatSearchResult, SearchResultItem } from '@/utils/search-results-utils';

export interface UseSongActionsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  memoizedSongs: SearchResultItem[];
}

export const useSongActions = ({ setMySongs, memoizedSongs }: UseSongActionsProps) => {
  const handleView = useCallback((songData: SongData | ArtistSong | SearchResultItem) => {
    // Handle different types of song data
    if ('path' in songData && songData.path) {
      // SongData or ArtistSong with path
      window.open(songData.path, '_blank');
    } else if ('url' in songData && songData.url) {
      // SearchResultItem with url
      window.open(songData.url, '_blank');
    }
  }, []);

  const handleAdd = useCallback((songId: string) => {
    if (!setMySongs) return;
    const item = memoizedSongs.find(item => {
      const formatted = formatSearchResult(item);
      return formatted.id === songId || item.url === songId || item.title === songId;
    });
    if (item) {
      const songData = formatSearchResult(item);
      setMySongs(prev => [...prev, songData]);
    }
  }, [setMySongs, memoizedSongs]);

  return {
    handleView,
    handleAdd
  };
};
