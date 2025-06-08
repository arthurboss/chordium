import { useCallback } from 'react';
import { Song } from '@/types/song';

export interface UseSongActionsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<Song[]>>;
  memoizedSongs: Song[];
}

export const useSongActions = ({ setMySongs, memoizedSongs }: UseSongActionsProps) => {
  const handleView = useCallback((songData: Song) => {
    // Handle Song with path
    if (songData.path) {
      window.open(songData.path, '_blank');
    }
  }, []);

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
