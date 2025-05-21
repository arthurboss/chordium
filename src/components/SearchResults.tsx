import React, { useMemo, useCallback } from 'react';
import ResultCard from "@/components/ResultCard";
import { SongData } from "@/types/song";
import { useSearchResults } from "@/hooks/useSearchResults";
import { formatSearchResult, formatArtistResult } from "@/utils/search-results-utils";
import { SearchResultItem } from "@/utils/search-result-item";
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import BlinkingArrow from "./ui/BlinkingArrow";
import './custom-scrollbar.css';

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

  const handleScroll = React.useCallback(({
    scrollOffset,
    scrollHeight,
    clientHeight
  }) => {
    const maxScroll = scrollHeight - clientHeight;
    setIsAtBottom(scrollOffset >= maxScroll - 30);
  }, []);

  if (!isVirtualized) {
    return (
      <div className="flex flex-col gap-2">
        {songs.map((item) => {
          const songData = formatSearchResult(item);
          return (
            <ResultCard
              key={songData.id}
              icon="music"
              title={songData.title}
              subtitle={songData.artist}
              onView={() => onView(songData)}
              onDelete={() => onDelete(songData.id)}
              idOrUrl={songData.id}
              deleteButtonIcon="plus"
              deleteButtonLabel={`Add ${songData.title}`}
              viewButtonIcon="view"
              viewButtonLabel="View Chords"
              isDeletable={true}
            />
          );
        })}
      </div>
    );
  }

  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = songs[index];
    const songData = formatSearchResult(item);
    return (
      <div style={style} key={songData.id}>
        <ResultCard
          icon="music"
          title={songData.title}
          subtitle={songData.artist}
          onView={() => onView(songData)}
          onDelete={() => onDelete(songData.id)}
          idOrUrl={songData.id}
          deleteButtonIcon="plus"
          deleteButtonLabel={`Add ${songData.title}`}
          viewButtonIcon="view"
          viewButtonLabel="View Chords"
          isDeletable={true}
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
            style={{ overflowY: 'scroll', overflowX: 'hidden' }}
            className="custom-scrollbar scrollbar-always"
          >
            {Row}
          </List>
        )}
      </AutoSizer>
      {!isAtBottom && (
        <div
          className="absolute left-0 bottom-5 w-full flex justify-center pointer-events-none z-10"
        >
          <BlinkingArrow direction="down" />
        </div>
      )}
    </div>
  );
});

export const ArtistResultsColumn = ({ artists, horizontal = false }: { artists: SearchResultItem[], horizontal?: boolean }) => {
  if (!artists || artists.length === 0) return null;
  const ITEM_HEIGHT = 120;
  const isVirtualized = artists.length >= 30;
  const resultLabel = artists.length === 1 ? 'result' : 'results';

  if (horizontal) {
    return (
      <div className="flex flex-row gap-4">
        {artists.map((item) => {
          const artistData = formatArtistResult(item);
          return (
            <div className="w-full max-w-xl">
              <ResultCard
                key={artistData.url}
                icon="user"
                title={artistData.name}
                onView={() => window.open(artistData.url, '_blank')}
                idOrUrl={artistData.url}
                viewButtonIcon="external"
                viewButtonLabel="See Artist Songs"
                isDeletable={false}
              />
            </div>
          );
        })}
      </div>
    );
  }

  if (isVirtualized) {
    return (
      <div className="artist-results-column w-full md:w-auto">
        <h2 className="text-lg font-medium mb-4">{artists.length} artist {resultLabel}</h2>
        <div className="relative w-full" style={{ height: '70vh', overflow: 'hidden' }}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={artists.length}
                itemSize={ITEM_HEIGHT}
                width={width}
                style={{ overflowY: 'scroll', overflowX: 'hidden' }}
                className="custom-scrollbar scrollbar-always"
              >
                {({ index, style }: ListChildComponentProps) => {
                  const item = artists[index];
                  const artistData = formatArtistResult(item);
                  return (
                    <div style={style} key={artistData.url}>
                      <ResultCard
                        icon="user"
                        title={artistData.name}
                        onView={() => window.open(artistData.url, '_blank')}
                        idOrUrl={artistData.url}
                        viewButtonIcon="external"
                        viewButtonLabel="See Artist Songs"
                        isDeletable={false}
                      />
                    </div>
                  );
                }}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }

  return (
    <div className="artist-results-column w-full md:w-auto">
      <h2 className="text-lg font-medium mb-4">{artists.length} artist {resultLabel}</h2>
      <div className="grid grid-cols-1 gap-y-6">
        {artists.map((item) => {
          const artistData = formatArtistResult(item);
          return (
            <ResultCard
              key={artistData.url}
              icon="user"
              title={artistData.name}
              onView={() => window.open(artistData.url, '_blank')}
              idOrUrl={artistData.url}
              viewButtonIcon="external"
              viewButtonLabel="See Artist Songs"
              isDeletable={false}
            />
          );
        })}
      </div>
    </div>
  );
};

export const SongResultsColumn = ({ songs, onView, onDelete, horizontal = false, showHeading = true }: SongListProps & { horizontal?: boolean, showHeading?: boolean }) => {
  if (!songs || songs.length === 0) return null;
  const resultLabel = songs.length === 1 ? 'result' : 'results';

  if (horizontal) {
    return (
      <div className="flex flex-row gap-4">
        {songs.map((item) => {
          const songData = formatSearchResult(item);
          return (
            <ResultCard
              key={songData.id}
              icon="music"
              title={songData.title}
              subtitle={songData.artist}
              onView={() => onView(songData)}
              onDelete={() => onDelete(songData.id)}
              idOrUrl={songData.id}
              deleteButtonIcon="plus"
              deleteButtonLabel={`Add ${songData.title}`}
              viewButtonIcon="view"
              viewButtonLabel="View Chords"
              isDeletable={true}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="song-results-column w-full md:w-auto">
      {showHeading && (
        <h2 className="text-lg font-medium mb-4">{songs.length} song {resultLabel}</h2>
      )}
      <SongList songs={songs} onView={onView} onDelete={onDelete} />
    </div>
  );
};

export const SearchResultsColumns = ({
  artists,
  songs,
  onView,
  onDelete
}: {
  artists: SearchResultItem[];
  songs: SearchResultItem[];
  onView: (song: SongData) => void;
  onDelete: (songId: string) => void;
}) => {
  // Mobile: artists row is horizontal scroll, songs are vertical below
  return (
    <>
      {/* Mobile layout */}
      <div className="flex flex-col gap-4 w-full md:hidden">
        {/* Artists row with heading and horizontal scroll */}
        <div className="w-full">
          <h2 className="text-lg font-medium mb-4">{artists.length} artist{artists.length === 1 ? '' : 's'} result{artists.length === 1 ? '' : 's'}</h2>
          <div className="overflow-x-auto pb-2 relative">
            <div className="flex flex-row gap-4 min-w-[350px]">
              <ArtistResultsColumn artists={artists} horizontal />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <BlinkingArrow direction="right" />
            </div>
          </div>
        </div>
        {/* Songs column with heading and vertical list */}
        <div className="w-full">
          {/* Only show heading here, not in SongResultsColumn */}
          <h2 className="text-lg font-medium mb-4">{songs.length} song{songs.length === 1 ? '' : 's'} result{songs.length === 1 ? '' : 's'}</h2>
          <SongResultsColumn songs={songs} onView={onView} onDelete={onDelete} showHeading={false} />
        </div>
      </div>
      {/* Desktop layout: columns, vertical scroll */}
      <div className="hidden md:flex flex-row gap-4 w-full">
        <div className="flex-1">
          <ArtistResultsColumn artists={artists} />
        </div>
        <div className="flex-1">
          <SongResultsColumn songs={songs} onView={onView} onDelete={onDelete} />
        </div>
      </div>
    </>
  );
};

const SearchResults = ({ setMySongs, setActiveTab, artist, song }: SearchResultsProps) => {
  const { artists, songs, loading, error } = useSearchResults(artist, song);

  const memoizedSongs = useMemo(() => songs, [songs]);
  const handleView = useCallback((songData: SongData) => window.open(songData.path, '_blank'), []);
  const handleAdd = useCallback((songId: string) => {
    if (!setMySongs) return;
    const item = memoizedSongs.find(item => formatSearchResult(item).id === songId);
    if (item) {
      const songData = formatSearchResult(item);
      setMySongs(prev => [...prev, songData]);
    }
  }, [setMySongs, memoizedSongs]);

  return (
    <SearchResultsColumns
      artists={artists}
      songs={memoizedSongs}
      onView={handleView}
      onDelete={handleAdd}
    />
  );
};

export default SearchResults;
