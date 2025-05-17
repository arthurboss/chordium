import SongCard from "./SongCard";
import ArtistCard from "./ArtistCard";
import { SongData } from "@/types/song";
import { useSearchResults } from "@/hooks/useSearchResults";
import { formatSearchResult, formatArtistResult, getQueryDisplayText } from "@/utils/search-results-utils";
import { getSearchParamsType } from "@/utils/search-utils";
import "@/components/ui/loading-spinner.css";
import { useAddToMySongs } from "@/hooks/useAddToMySongs";
import { useArtistSongs } from "@/hooks/useArtistSongs";
import ArtistSongsResult from "./ArtistSongsResult";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

interface SearchResultsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  setActiveTab?: (tab: string) => void;
  artistLoading: boolean;
}

const SearchResults = ({ setMySongs, setActiveTab, artistLoading: artistLoadingProp }: SearchResultsProps) => {
  const { results, loading, error, searchParams } = useSearchResults();
  const [artistLoadingExternal] = [artistLoadingProp]; // for compatibility
  const addToMySongs = useAddToMySongs(setMySongs, setActiveTab);
  const { artistSongs, artistLoading, artistError, handleArtistClick, resetArtistSongs } = useArtistSongs();

  const isLoading = loading || artistLoading || artistLoadingExternal;

  const handleViewSong = (song: SongData) => {
    window.open(song.path, "_blank", "noopener,noreferrer");
  };

  // Declarative, prioritized render conditions for performance and maintainability
  const renderers: Array<{ condition: boolean; render: () => React.ReactNode }> = [
    {
      condition: isLoading,
      render: () => <LoadingState message={artistLoading ? 'Loading artist songs...' : 'Searching chord sheets...'} />,
    },
    {
      condition: Boolean(artistSongs),
      render: () => (
        <ArtistSongsResult
          artistSongs={artistSongs}
          onView={handleViewSong}
          onAdd={addToMySongs}
          onBack={resetArtistSongs}
        />
      ),
    },
    {
      condition: Boolean(error || artistError),
      render: () => <ErrorState error={error || artistError || ''} />,
    },
    // Only show EmptyState if not loading and we have already received a response (i.e., !loading && !isLoading)
    {
      condition: !loading && !isLoading && results.length === 0,
      render: () => <EmptyState searchParams={searchParams} />,
    },
  ];

  const matchedRenderer = renderers.find(r => r.condition);

  if (matchedRenderer) return matchedRenderer.render();

  // Default: show results
  return (
    <>
      <h2 className="text-lg font-medium mb-4">
        {results.length} results for {getQueryDisplayText(searchParams)}
        <span className="block text-sm text-muted-foreground mt-1">
          Results from Cifra Club. Click "+" to add to your songs.
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map(item => {
          const type = getSearchParamsType(searchParams);
          if (type === 'artist') {
            const artistData = formatArtistResult(item);
            return (
              <ArtistCard
                key={artistData.url}
                artistName={artistData.name}
                artistUrl={artistData.url}
                onView={handleArtistClick}
                viewButtonIcon="external"
                viewButtonLabel="See Artist Songs"
              />
            );
          }
          const songData = formatSearchResult(item);
          return (
            <SongCard
              key={songData.id}
              song={songData}
              onView={handleViewSong}
              onDelete={() => addToMySongs(songData)}
              deleteButtonIcon="plus"
              deleteButtonLabel={`Add ${songData.title}`}
              viewButtonIcon="external"
              viewButtonLabel="Open in Cifra Club"
            />
          );
        })}
      </div>
    </>
  );
};

export default SearchResults;
