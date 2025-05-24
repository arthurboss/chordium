import { useCallback } from 'react';
import { Song } from '@/types/song';
import { Song } from '@/types/song';
import { formatSearchResult, SearchResultItem } from '@/utils/search-results-utils';

export interface UseSongActionsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  memoizedSongs: SearchResultItem[];
}

export const useSongActions = ({ setMySongs, memoizedSongs }: UseSongActionsProps) => {
  const handleView = useCallback((songData: Song | Song | SearchResultItem) => {
    // Handle different types of song data
    if ('path' in songData && songData.path) {
      // Song or Song with path
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
