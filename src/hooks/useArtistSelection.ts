import { Artist } from '@/types/artist';
import { SearchResultsAction } from '@/hooks/useSearchResultsReducer';

type UseArtistSelectionProps = {
  dispatch: React.Dispatch<SearchResultsAction>;
  onArtistSelect: (artist: Artist) => void;
};

export const useArtistSelection = ({ dispatch, onArtistSelect }: UseArtistSelectionProps) => {
  const handleArtistSelect = (artist: Artist) => {
    onArtistSelect(artist);
  };

  return { handleArtistSelect };
};
