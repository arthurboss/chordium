import { Artist } from '@/types/artist';

type UseArtistSelectionProps = {
  dispatch: (action: { type: string; artist: Artist }) => void;
  onArtistSelect: (artist: Artist) => void;
};

export const useArtistSelection = ({ dispatch, onArtistSelect }: UseArtistSelectionProps) => {
  const handleArtistSelect = (artist: Artist) => {
    dispatch({ type: 'ARTIST_SONGS_START', artist });
    onArtistSelect(artist);
  };

  return { handleArtistSelect };
};
