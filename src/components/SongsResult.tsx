import { Song } from "@/types/song";
import { SearchResultItem } from "@/utils/search-result-item";
import { formatSearchResult } from "@/utils/format-search-result";
import ResultCard from "@/components/ResultCard";
import VirtualizedListWithArrow from "@/components/ui/VirtualizedListWithArrow";
import { ListChildComponentProps } from 'react-window';
import React, { useCallback } from 'react';
import { CARD_HEIGHTS } from "@/constants/ui-constants";
import '@/components/custom-scrollbar.css';

interface SongsResultProps {
  // For artist-based songs
  artistSongs?: Song[];
  // For song-only searches
  songs?: SearchResultItem[];
  onView: (song: Song | SearchResultItem) => void;
  onAdd: (song: Song | SearchResultItem) => void;
  onBack: () => void;
  searchType?: 'artist' | 'song';
}

const SongsResult = ({ 
  artistSongs = [], 
  songs = [], 
  onView, 
  onAdd, 
  onBack, 
  searchType = 'artist' 
}: SongsResultProps) => {
  // Determine which data source to use
  const displaySongs: (Song | SearchResultItem)[] = searchType === 'artist' ? artistSongs : songs;
  const isArtistSearch = searchType === 'artist';

  // Render a song item for the virtualized list
  const renderSongItem = useCallback(({ index, style, item }: ListChildComponentProps & { item: Song | SearchResultItem }) => {
    // Type guard to check if item is Song or SearchResultItem
    const isSongData = 'id' in item;
    
    let songTitle: string;
    let songArtist: string;
    
    if (isSongData) {
      // Handle Song
      songTitle = item.title;
      songArtist = item.artist;
    } else {
      // Handle SearchResultItem - convert to Song for consistent handling
      const converted = formatSearchResult(item);
      songTitle = converted.title;
      songArtist = converted.artist;
    }

    return (
      <div style={style}>
        <ResultCard
          key={`${isSongData ? item.path || 'path' : item.url}-${songTitle || 'title'}-${index}`}
          icon="music"
          title={songTitle}
          subtitle={songArtist}
          onView={() => onView(item)}
          onDelete={() => onAdd(item)}
          idOrUrl={isSongData ? item.id : item.url}
          deleteButtonIcon="plus"
          deleteButtonLabel={`Add ${songTitle}`}
          viewButtonIcon="external"
          viewButtonLabel="Open"
          isDeletable={true}
        />
      </div>
    );
  }, [onView, onAdd]);

  // Use regular grid layout for small number of items
  if (displaySongs.length < 10) {
    return (
      <>
        <h2 className="text-lg font-medium mb-4">
          {displaySongs.length} {isArtistSearch ? 'songs for artist' : 'song results'}
          <span className="block text-sm text-muted-foreground mt-1">
            Songs from Cifra Club. Click "+" to add to your songs.
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displaySongs.map((song, index) => {
            const isSongData = 'id' in song;
            
            let songTitle: string;
            let songArtist: string;
            
            if (isSongData) {
              // Handle Song
              songTitle = song.title;
              songArtist = song.artist;
            } else {
              // Handle SearchResultItem - convert to Song for consistent handling
              const converted = formatSearchResult(song);
              songTitle = converted.title;
              songArtist = converted.artist;
            }
            
            return (
              <ResultCard
                key={`${isSongData ? song.path || 'path' : song.url}-${songTitle || 'title'}-${index}`}
                icon="music"
                title={songTitle}
                subtitle={songArtist}
                onView={() => onView(song)}
                onDelete={() => onAdd(song)}
                idOrUrl={isSongData ? song.id : song.url}
                deleteButtonIcon="plus"
                deleteButtonLabel={`Add ${songTitle}`}
                viewButtonIcon="external"
                viewButtonLabel="Open"
                isDeletable={true}
              />
            );
          })}
        </div>
      </>
    );
  }

  // Use virtualized list for large number of items
  return (
    <>
      <h2 className="text-lg font-medium mb-4">
        {displaySongs.length} {isArtistSearch ? 'songs for artist' : 'song results'}
        <span className="block text-sm text-muted-foreground mt-1">
          Songs from Cifra Club. Click "+" to add to your songs.
        </span>
      </h2>
      <div className="w-full mb-4 songs-view-height">
        <VirtualizedListWithArrow
          items={displaySongs}
          itemHeight={CARD_HEIGHTS.RESULT_CARD}
          renderItem={renderSongItem}
          height="100%"
          showArrow={displaySongs.length > 3}
        />
      </div>
    </>
  );
};

export default SongsResult;
