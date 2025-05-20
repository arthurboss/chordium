import React, { useMemo, useCallback } from 'react';
import SongCard from "./SongCard";
import ArtistCard from "./ArtistCard";
import { SongData } from "@/types/song";
import { useSearchResults } from "@/hooks/useSearchResults";
import { formatSearchResult, formatArtistResult } from "@/utils/search-results-utils";
import { SearchResultItem } from "@/utils/search-result-item";
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import BlinkingArrowDown from "./ui/BlinkingArrowDown";

interface SearchResultsProps {
  setMySongs?: React.Dispatch<React.SetStateAction<SongData[]>>;
  setActiveTab?: (tab: string) => void;
  artist: string;
  song: string;
}

interface SongListProps {
  songs: SearchResultItem[];
  onView: (song: SongData) => void;
  onDelete: (songId: string) => void;
}

const SongList = React.memo(({ songs, onView, onDelete }: SongListProps) => {
  const ITEM_HEIGHT = 120;
  const isVirtualized = songs.length >= 30;
  const [isAtBottom, setIsAtBottom] = React.useState(false);

  // Handler to check if user is at the bottom of the list
  const handleScroll = React.useCallback(({
    scrollOffset,
    scrollHeight,
    clientHeight
  }) => {
    const maxScroll = scrollHeight - clientHeight;
    setIsAtBottom(scrollOffset >= maxScroll - 30); // 2px tolerance
  }, []);

  if (!isVirtualized) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {songs.map((item) => {
          const songData = formatSearchResult(item);
          return (
            <SongCard
              key={songData.id}
              song={songData}
              onView={onView}
              onDelete={() => onDelete(songData.id)}
              deleteButtonIcon="plus"
              deleteButtonLabel={`Add ${songData.title}`}
              viewButtonIcon="view"
              viewButtonLabel="View Chords"
            />
          );
        })}
      </div>
    );
  }

  // Virtualized list for large result sets
  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = songs[index];
    const songData = formatSearchResult(item);
    return (
      <div style={style} key={songData.id}>
        <SongCard
          song={songData}
          onView={onView}
          onDelete={() => onDelete(songData.id)}
          deleteButtonIcon="plus"
          deleteButtonLabel={`Add ${songData.title}`}
          viewButtonIcon="view"
          viewButtonLabel="View Chords"
        />
      </div>
    );
  };

  return (
    <div className="relative w-full" style={{ height: '70vh', overflow: 'hidden' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={songs.length}
            itemSize={ITEM_HEIGHT}
            width={width}
            onScroll={({ scrollOffset }) => {
              const scrollHeight = ITEM_HEIGHT * songs.length;
              const clientHeight = height;
              handleScroll({
                scrollOffset,
                scrollHeight,
                clientHeight
              });
            }}
            style={{ overflow: 'auto', scrollbarWidth: 'none' }}
            className="[&::-webkit-scrollbar]:hidden"
          >
            {Row}
          </List>
        )}
      </AutoSizer>
      {!isAtBottom && (
        <div
          className="absolute left-0 bottom-2 w-full flex justify-center pointer-events-none z-10"
        >
          <BlinkingArrowDown />
        </div>
      )}
    </div>
  );
});

const SearchResults = ({ setMySongs, setActiveTab, artist, song }: SearchResultsProps) => {
  const { artists, songs, loading, error } = useSearchResults(artist, song);

  // Memoize formatted song list for performance
  const memoizedSongs = useMemo(() => songs, [songs]);
  const handleView = useCallback((songData: SongData) => window.open(songData.path, '_blank'), []);
  const handleAdd = useCallback((songId: string) => {
    if (!setMySongs) return;
    // Find the songData from the memoizedSongs
    const item = memoizedSongs.find(item => formatSearchResult(item).id === songId);
    if (item) {
      const songData = formatSearchResult(item);
      setMySongs(prev => [...prev, songData]);
    }
  }, [setMySongs, memoizedSongs]);

  // Render artists if artist search is present and no song search
  if (artist && !song) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-4">{artists.length} artist result(s)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artists.map((item) => {
            const artistData = formatArtistResult(item);
            return (
              <ArtistCard
                key={artistData.url}
                artistName={artistData.name}
                artistUrl={artistData.url}
                onView={() => window.open(artistData.url, '_blank')}
                viewButtonIcon="external"
                viewButtonLabel="See Artist Songs"
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Render songs if song search is present (with or without artist)
  if (memoizedSongs.length > 0) {
    return (
      <div>
        <h2 className="text-lg font-medium mb-4">{memoizedSongs.length} song result(s)</h2>
        <SongList songs={memoizedSongs} onView={handleView} onDelete={handleAdd} />
      </div>
    );
  }

  // Empty state
  return <div>No results found.</div>;
};

export default SearchResults;
