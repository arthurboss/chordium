import { useCallback } from 'react';
import { SongData } from '@/types/song';
import { formatSearchResult, SearchResultItem } from '@/utils/search-results-utils';

export interface UseSongActionsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  memoizedSongs: SearchResultItem[];
}

export const useSongActions = ({ setMySongs, memoizedSongs }: UseSongActionsProps) => {
  const handleView = useCallback((songData: SongData) => {
    window.open(songData.path, '_blank');
  }, []);

  const handleAdd = useCallback((songId: string) => {
    if (!setMySongs) return;
    const item = memoizedSongs.find(item => formatSearchResult(item).id === songId);
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
