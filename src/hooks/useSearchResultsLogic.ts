import { useMemo } from 'react';
import { SongData } from '@/types/song';
import { Artist } from '@/types/artist';
import { useSearchResults } from '@/hooks/useSearchResults';
import { useArtistSongs } from '@/hooks/useArtistSongs';
import { filterSongsByTitle } from '@/utils/song-filter-utils';
import { determineSearchResultState } from '@/utils/search-result-states';
import { useSongActions } from '@/utils/search-song-actions';

interface UseSearchResultsLogicProps {
  artist: string;
  song: string;
  filterArtist: string;
  filterSong: string;
  activeArtist: Artist | null;
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
}

export const useSearchResultsLogic = ({
  artist,
  song,
  filterArtist,
  filterSong,
  activeArtist,
  setMySongs
}: UseSearchResultsLogicProps) => {
  // Fetch search results and artist songs
  const { artists, songs, loading, error } = useSearchResults(artist, song, filterArtist, filterSong);
  const { songs: artistSongs, loading: artistSongsLoading, error: artistSongsError } = useArtistSongs(activeArtist);

  // Memoized data
  const memoizedSongs = useMemo(() => activeArtist ? artistSongs : songs, [songs, artistSongs, activeArtist]);
  const memoizedArtists = useMemo(() => artists, [artists]);

  // Filtered artist songs
  const filteredArtistSongs = useMemo(() => {
    if (!activeArtist || !artistSongs.length) return [];
    return filterSongsByTitle(artistSongs, filterSong);
  }, [activeArtist, artistSongs, filterSong]);

  // Determine current state
  const stateData = useMemo(() => 
    determineSearchResultState(
      loading,
      error,
      artistSongsLoading,
      artistSongsError,
      activeArtist,
      artistSongs
    ),
    [loading, error, artistSongsLoading, artistSongsError, activeArtist, artistSongs]
  );

  // Song actions
  const { handleView, handleAdd } = useSongActions({
    setMySongs,
    memoizedSongs
  });

  return {
    stateData,
    memoizedArtists,
    filteredArtistSongs,
    handleView,
    handleAdd
  };
};
